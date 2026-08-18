const Booking = require("../models/Booking");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const razorpayX = require("./razorpayXService");

const SUCCESS_PAYOUT_STATUSES = new Set(["processed"]);
const FAILED_PAYOUT_STATUSES = new Set(["failed", "reversed", "cancelled", "rejected"]);

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
}

function maskAccount(accountNumber) {
  const value = String(accountNumber || "").replace(/\s+/g, "");
  if (!value) return "";
  return value.length <= 4 ? value : `${"*".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;
}

function payoutStatusToLocal(status) {
  switch (String(status || "").toLowerCase()) {
    case "processed": return "processed";
    case "queued": return "queued";
    case "pending": return "pending_approval";
    case "processing": return "processing";
    case "reversed": return "reversed";
    case "cancelled": return "cancelled";
    case "rejected": return "failed";
    case "failed": return "failed";
    default: return "processing";
  }
}

async function createLedgerEntry(data) {
  try {
    return await WalletTransaction.create(data);
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
}

async function settleRidePayment(bookingOrId) {
  const bookingId = bookingOrId?._id || bookingOrId;
  const locked = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      paymentStatus: "paid",
      walletSettlementStatus: { $ne: "settled" }
    },
    { $set: { walletSettlementStatus: "settling" } },
    { new: true }
  );

  if (!locked) {
    return Booking.findById(bookingId);
  }

  try {
    const driverId = locked.driver?._id || locked.driver;
    if (!driverId) throw new Error("Booking me assigned driver nahi hai");

    const fare = money(
      locked.finalFare || locked.driverOfferedFare || locked.fare?.finalFare || locked.fare?.totalFare || locked.estimatedFare
    );
    const commissionPercent = Number(locked.platformCommissionPercent || 10);
    const commission = money(
      locked.platformCommissionAmount || (fare * commissionPercent) / 100
    );
    const driverEarning = money(
      locked.driverPayableAmount || fare - commission
    );

    if (fare <= 0) throw new Error("Final fare valid nahi hai");

    let updatedDriver;

    if (locked.paymentMethod === "online") {
      const driver = await User.findOne({ _id: driverId, role: "driver" });
      if (!driver) throw new Error("Driver wallet nahi mila");

      // Purani cash rides ki unpaid company commission ko next online earning se
      // automatically recover karo. Driver ko gross earning report me poora net
      // earning dikhega, par wallet credit due commission minus karke hoga.
      const oldCommissionDue = money(driver.wallet?.cashCommissionDue);
      const recoveredDue = Math.min(oldCommissionDue, driverEarning);
      const walletCredit = money(driverEarning - recoveredDue);

      updatedDriver = await User.findOneAndUpdate(
        { _id: driverId, role: "driver" },
        {
          $inc: {
            "wallet.balance": walletCredit,
            "wallet.totalEarned": driverEarning,
            "wallet.cashCommissionDue": -recoveredDue,
            "wallet.totalCommissionPaid": recoveredDue
          },
          $set: { "wallet.lastSettledAt": new Date() }
        },
        { new: true }
      );

      if (!updatedDriver) throw new Error("Driver wallet nahi mila");

      await createLedgerEntry({
        driver: driverId,
        booking: locked._id,
        type: "ride_online_credit",
        direction: "credit",
        amount: driverEarning,
        balanceAfter: money(updatedDriver.wallet?.balance),
        pendingAfter: money(updatedDriver.wallet?.pendingAmount),
        cashCommissionDueAfter: money(updatedDriver.wallet?.cashCommissionDue),
        referenceId: locked.razorpayPaymentId || String(locked._id),
        description: recoveredDue > 0
          ? `Online earning ₹${driverEarning.toFixed(2)}; ₹${recoveredDue.toFixed(2)} old cash commission recover hua, ₹${walletCredit.toFixed(2)} wallet credit`
          : `Online ride earning ₹${driverEarning.toFixed(2)} credited`,
        metadata: { driverEarning, recoveredDue, walletCredit }
      });
    } else {
      const driver = await User.findOne({ _id: driverId, role: "driver" });
      if (!driver) throw new Error("Driver wallet nahi mila");

      const currentBalance = money(driver.wallet?.balance);
      const commissionDebit = Math.min(currentBalance, commission);
      const due = money(commission - commissionDebit);

      updatedDriver = await User.findOneAndUpdate(
        { _id: driverId, role: "driver" },
        {
          $inc: {
            "wallet.balance": -commissionDebit,
            "wallet.totalEarned": driverEarning,
            "wallet.cashCommissionDue": due,
            "wallet.totalCommissionPaid": commissionDebit
          },
          $set: { "wallet.lastSettledAt": new Date() }
        },
        { new: true }
      );

      await createLedgerEntry({
        driver: driverId,
        booking: locked._id,
        type: "ride_cash_earning",
        direction: "info",
        amount: driverEarning,
        balanceAfter: money(updatedDriver.wallet?.balance),
        pendingAfter: money(updatedDriver.wallet?.pendingAmount),
        cashCommissionDueAfter: money(updatedDriver.wallet?.cashCommissionDue),
        referenceId: String(locked._id),
        description: `Cash ride net earning ₹${driverEarning.toFixed(2)}`
      });

      if (commissionDebit > 0) {
        await createLedgerEntry({
          driver: driverId,
          booking: locked._id,
          type: "cash_commission_debit",
          direction: "debit",
          amount: commissionDebit,
          balanceAfter: money(updatedDriver.wallet?.balance),
          pendingAfter: money(updatedDriver.wallet?.pendingAmount),
          cashCommissionDueAfter: money(updatedDriver.wallet?.cashCommissionDue),
          referenceId: String(locked._id),
          description: `Cash ride platform commission ₹${commissionDebit.toFixed(2)} deducted`
        });
      }

      if (due > 0) {
        await createLedgerEntry({
          driver: driverId,
          booking: locked._id,
          type: "cash_commission_due",
          direction: "info",
          amount: due,
          balanceAfter: money(updatedDriver.wallet?.balance),
          pendingAfter: money(updatedDriver.wallet?.pendingAmount),
          cashCommissionDueAfter: money(updatedDriver.wallet?.cashCommissionDue),
          referenceId: String(locked._id),
          description: `Cash commission ₹${due.toFixed(2)} wallet me insufficient balance ki wajah se due hai`
        });
      }
    }

    locked.walletSettlementStatus = "settled";
    locked.walletSettledAt = new Date();
    await locked.save();
    return locked;
  } catch (error) {
    await Booking.findByIdAndUpdate(bookingId, {
      $set: { walletSettlementStatus: "not_settled" }
    });
    throw error;
  }
}

async function ensureContactAndFundAccount(driver, method, destination) {
  const bankDetails = driver.driverProfile?.bankDetails || {};
  let contactId = bankDetails.razorpayContactId || "";

  if (!contactId) {
    const contact = await razorpayX.createContact(driver);
    contactId = contact.id;
    driver.driverProfile.bankDetails.razorpayContactId = contactId;
  }

  if (method === "upi") {
    let fundAccountId = bankDetails.razorpayUpiFundAccountId || "";
    const upiId = String(destination.upiId || bankDetails.upiId || "").trim().toLowerCase();
    if (!upiId || !/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      throw new Error("Valid UPI ID save karo");
    }

    if (!fundAccountId || upiId !== String(bankDetails.upiId || "").trim().toLowerCase()) {
      const fund = await razorpayX.createUpiFundAccount({ contactId, upiId });
      fundAccountId = fund.id;
      driver.driverProfile.bankDetails.razorpayUpiFundAccountId = fundAccountId;
      driver.driverProfile.bankDetails.upiId = upiId;
    }

    await driver.save();
    return { contactId, fundAccountId, destination: { upiId } };
  }

  const accountNumber = String(destination.accountNumber || bankDetails.accountNumber || "").trim();
  const ifsc = String(destination.ifsc || bankDetails.ifscCode || "").trim().toUpperCase();
  const accountHolderName = String(
    destination.accountHolderName || bankDetails.accountHolderName || driver.driverProfile?.legalName || driver.name || ""
  ).trim();
  const bankName = String(destination.bankName || bankDetails.bankName || "").trim();

  if (!accountNumber || !/^\d{6,20}$/.test(accountNumber)) {
    throw new Error("Valid bank account number save karo");
  }
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    throw new Error("Valid IFSC code save karo");
  }
  if (!accountHolderName) throw new Error("Account holder name required hai");

  let fundAccountId = bankDetails.razorpayBankFundAccountId || "";
  const detailsChanged =
    accountNumber !== String(bankDetails.accountNumber || "").trim() ||
    ifsc !== String(bankDetails.ifscCode || "").trim().toUpperCase() ||
    accountHolderName !== String(bankDetails.accountHolderName || "").trim();

  if (!fundAccountId || detailsChanged) {
    const fund = await razorpayX.createBankFundAccount({
      contactId,
      accountHolderName,
      accountNumber,
      ifsc
    });
    fundAccountId = fund.id;
    driver.driverProfile.bankDetails.razorpayBankFundAccountId = fundAccountId;
  }

  driver.driverProfile.bankDetails.accountHolderName = accountHolderName;
  driver.driverProfile.bankDetails.accountNumber = accountNumber;
  driver.driverProfile.bankDetails.ifscCode = ifsc;
  driver.driverProfile.bankDetails.bankName = bankName;
  await driver.save();

  return {
    contactId,
    fundAccountId,
    destination: { accountHolderName, accountNumber, ifsc, bankName }
  };
}

async function finalizeWithdrawal(withdrawal, payoutData) {
  const payoutStatus = String(payoutData?.status || "").toLowerCase();
  if (!payoutStatus) return withdrawal;

  const current = await WithdrawalRequest.findById(withdrawal._id);
  if (!current) throw new Error("Withdrawal request nahi mili");

  const razorpayFields = {
    razorpayStatus: payoutData.status || current.razorpayStatus,
    utr: payoutData.utr || current.utr || "",
    rawStatusDetails: payoutData.status_details || null,
    failureReason: ""
  };

  if (SUCCESS_PAYOUT_STATUSES.has(payoutStatus)) {
    if (current.status === "processed") return current;
    if (["failed", "reversed", "cancelled"].includes(current.status)) {
      return current;
    }

    const changed = await WithdrawalRequest.findOneAndUpdate(
      {
        _id: current._id,
        status: { $nin: ["processed", "failed", "reversed", "cancelled"] }
      },
      {
        $set: {
          ...razorpayFields,
          status: "processed",
          processedAt: new Date(),
          failedAt: null
        }
      },
      { new: true }
    );

    if (changed) {
      const driver = await User.findByIdAndUpdate(
        current.driver,
        {
          $inc: {
            "wallet.pendingAmount": -current.amount,
            "wallet.totalWithdrawn": current.amount
          }
        },
        { new: true }
      );

      await createLedgerEntry({
        driver: current.driver,
        withdrawal: current._id,
        type: "payout_success",
        direction: "info",
        amount: current.amount,
        balanceAfter: money(driver?.wallet?.balance),
        pendingAfter: money(driver?.wallet?.pendingAmount),
        cashCommissionDueAfter: money(driver?.wallet?.cashCommissionDue),
        referenceId: payoutData.id || current.razorpayPayoutId,
        description: `Payout ₹${current.amount.toFixed(2)} processed`
      });
      return changed;
    }
    return WithdrawalRequest.findById(current._id);
  }

  if (FAILED_PAYOUT_STATUSES.has(payoutStatus)) {
    if (["failed", "reversed", "cancelled"].includes(current.status)) {
      return current;
    }

    const localStatus = payoutStatus === "reversed"
      ? "reversed"
      : payoutStatus === "cancelled"
        ? "cancelled"
        : "failed";

    const changed = await WithdrawalRequest.findOneAndUpdate(
      { _id: current._id, status: current.status },
      {
        $set: {
          ...razorpayFields,
          status: localStatus,
          failedAt: new Date(),
          failureReason:
            payoutData?.status_details?.description ||
            payoutData?.status_details?.reason ||
            `Payout ${payoutData.status}`
        }
      },
      { new: true }
    );

    if (!changed) return WithdrawalRequest.findById(current._id);

    // Razorpay docs ke mutabik processed payout rare case me reversed ho sakta hai.
    // Is case me pending pehle hi zero ho chuka hota hai aur totalWithdrawn reverse karna hota hai.
    const wasProcessed = current.status === "processed";
    const walletInc = wasProcessed
      ? {
          "wallet.balance": current.amount,
          "wallet.totalWithdrawn": -current.amount
        }
      : {
          "wallet.balance": current.amount,
          "wallet.pendingAmount": -current.amount
        };

    const driver = await User.findByIdAndUpdate(
      current.driver,
      { $inc: walletInc },
      { new: true }
    );

    await createLedgerEntry({
      driver: current.driver,
      withdrawal: current._id,
      type: "payout_refund",
      direction: "credit",
      amount: current.amount,
      balanceAfter: money(driver?.wallet?.balance),
      pendingAfter: money(driver?.wallet?.pendingAmount),
      cashCommissionDueAfter: money(driver?.wallet?.cashCommissionDue),
      referenceId: payoutData.id || current.razorpayPayoutId || String(current._id),
      description: wasProcessed
        ? `Processed payout ₹${current.amount.toFixed(2)} reverse hua; wallet restore kiya`
        : `Failed payout ₹${current.amount.toFixed(2)} wallet me restore hua`
    });
    return changed;
  }

  if (["processed", "failed", "reversed", "cancelled"].includes(current.status)) {
    return current;
  }

  return WithdrawalRequest.findByIdAndUpdate(
    current._id,
    {
      $set: {
        ...razorpayFields,
        status: payoutStatusToLocal(payoutStatus)
      }
    },
    { new: true }
  );
}

async function failAndRestoreWithdrawal(withdrawal, error) {
  const current = await WithdrawalRequest.findById(withdrawal._id);
  if (!current) return null;
  if (["processed", "failed", "reversed", "cancelled"].includes(current.status)) {
    return current;
  }

  const failed = await WithdrawalRequest.findOneAndUpdate(
    { _id: current._id, status: current.status },
    {
      $set: {
        status: "failed",
        failedAt: new Date(),
        failureReason: String(error?.message || "Payout failed").slice(0, 1000),
        rawStatusDetails: error?.razorpay?.error || error?.razorpay || null
      }
    },
    { new: true }
  );

  if (!failed) return WithdrawalRequest.findById(current._id);

  const restored = await User.findByIdAndUpdate(
    current.driver,
    {
      $inc: {
        "wallet.balance": current.amount,
        "wallet.pendingAmount": -current.amount
      }
    },
    { new: true }
  );

  await createLedgerEntry({
    driver: current.driver,
    withdrawal: current._id,
    type: "payout_refund",
    direction: "credit",
    amount: current.amount,
    balanceAfter: money(restored?.wallet?.balance),
    pendingAfter: money(restored?.wallet?.pendingAmount),
    cashCommissionDueAfter: money(restored?.wallet?.cashCommissionDue),
    referenceId: String(current._id),
    description: `Payout start fail hua; ₹${current.amount.toFixed(2)} wallet me restore kiya`
  });

  return failed;
}

async function requestWithdrawal({ driverId, amount, method, destination = {}, source = "instant" }) {
  const withdrawalAmount = money(amount);
  if (withdrawalAmount < 100) throw new Error("Minimum withdrawal ₹100 hai");
  if (!["upi", "bank"].includes(method)) throw new Error("Withdrawal method UPI ya bank hona chahiye");

  const driver = await User.findOne({ _id: driverId, role: "driver" });
  if (!driver) throw new Error("Driver nahi mila");

  if (!razorpayX.isEnabled()) {
    const config = razorpayX.getConfigurationStatus();
    throw new Error(`Instant payout live ready nahi hai: ${config.missing.join(", ")}`);
  }

  const reserved = await User.findOneAndUpdate(
    {
      _id: driverId,
      role: "driver",
      "wallet.balance": { $gte: withdrawalAmount }
    },
    {
      $inc: {
        "wallet.balance": -withdrawalAmount,
        "wallet.pendingAmount": withdrawalAmount
      }
    },
    { new: true }
  );

  if (!reserved) {
    throw new Error(`Insufficient wallet balance. Available ₹${money(driver.wallet?.balance).toFixed(0)} hai.`);
  }

  const idempotencyKey = razorpayX.makeIdempotencyKey();
  const withdrawal = await WithdrawalRequest.create({
    driver: driverId,
    amount: withdrawalAmount,
    method,
    source,
    status: "requested",
    idempotencyKey,
    destination: {
      upiId: String(destination.upiId || driver.driverProfile?.bankDetails?.upiId || "").trim(),
      bankName: String(destination.bankName || driver.driverProfile?.bankDetails?.bankName || "").trim(),
      accountHolderName: String(destination.accountHolderName || driver.driverProfile?.bankDetails?.accountHolderName || "").trim(),
      accountNumber: String(destination.accountNumber || driver.driverProfile?.bankDetails?.accountNumber || "").trim(),
      ifsc: String(destination.ifsc || driver.driverProfile?.bankDetails?.ifscCode || "").trim().toUpperCase(),
      maskedAccount: maskAccount(destination.accountNumber || driver.driverProfile?.bankDetails?.accountNumber)
    }
  });

  await createLedgerEntry({
    driver: driverId,
    withdrawal: withdrawal._id,
    type: "payout_hold",
    direction: "debit",
    amount: withdrawalAmount,
    balanceAfter: money(reserved.wallet?.balance),
    pendingAfter: money(reserved.wallet?.pendingAmount),
    cashCommissionDueAfter: money(reserved.wallet?.cashCommissionDue),
    status: "pending",
    referenceId: String(withdrawal._id),
    description: `Payout ₹${withdrawalAmount.toFixed(2)} reserved`
  });

  try {
    withdrawal.status = "processing";
    await withdrawal.save();

    const liveDriver = await User.findById(driverId);
    const fund = await ensureContactAndFundAccount(liveDriver, method, withdrawal.destination);
    withdrawal.razorpayContactId = fund.contactId;
    withdrawal.razorpayFundAccountId = fund.fundAccountId;
    await withdrawal.save();

    const payout = await razorpayX.createPayout({
      fundAccountId: fund.fundAccountId,
      amount: withdrawalAmount,
      method,
      referenceId: `hmg_${String(withdrawal._id)}`,
      idempotencyKey,
      driverId,
      // Instant request low balance par queue nahi hogi; clear failure + internal refund.
      // Scheduled payout queue ho sakti hai.
      queueIfLowBalance: source === "scheduled"
    });

    withdrawal.razorpayPayoutId = payout.id || "";
    withdrawal.razorpayStatus = payout.status || "";
    await withdrawal.save();
    return finalizeWithdrawal(withdrawal, payout);
  } catch (error) {
    if (error?.payoutOutcomeUnknown) {
      // Network timeout/5xx ka matlab payout bana bhi ho sakta hai. Balance refund karna
      // double payout risk hai. Same idempotency key se scheduler safe retry karega.
      return WithdrawalRequest.findByIdAndUpdate(
        withdrawal._id,
        {
          $set: {
            status: "uncertain",
            failureReason: String(error.message || "Payout response uncertain").slice(0, 1000)
          }
        },
        { new: true }
      );
    }

    await failAndRestoreWithdrawal(withdrawal, error);
    throw error;
  }
}

async function retryUncertainPayouts(limit = 10) {
  if (!razorpayX.isEnabled()) return { checked: 0 };

  const requests = await WithdrawalRequest.find({
    status: "uncertain",
    razorpayPayoutId: "",
    razorpayFundAccountId: { $ne: "" }
  })
    .sort({ updatedAt: 1 })
    .limit(limit);

  let checked = 0;
  for (const withdrawal of requests) {
    try {
      const payout = await razorpayX.createPayout({
        fundAccountId: withdrawal.razorpayFundAccountId,
        amount: withdrawal.amount,
        method: withdrawal.method,
        referenceId: `hmg_${String(withdrawal._id)}`,
        idempotencyKey: withdrawal.idempotencyKey,
        driverId: withdrawal.driver,
        queueIfLowBalance: withdrawal.source === "scheduled"
      });

      withdrawal.razorpayPayoutId = payout.id || "";
      withdrawal.razorpayStatus = payout.status || "";
      withdrawal.failureReason = "";
      await withdrawal.save();
      await finalizeWithdrawal(withdrawal, payout);
      checked += 1;
    } catch (error) {
      if (error?.payoutOutcomeUnknown) {
        await WithdrawalRequest.findByIdAndUpdate(withdrawal._id, {
          $set: { failureReason: String(error.message || "Payout response uncertain").slice(0, 1000) }
        });
      } else {
        await failAndRestoreWithdrawal(withdrawal, error);
      }
    }
  }

  return { checked };
}

async function reconcilePendingPayouts(limit = 25) {
  if (!razorpayX.isEnabled()) return { checked: 0 };

  const requests = await WithdrawalRequest.find({
    razorpayPayoutId: { $ne: "" },
    status: { $in: ["processing", "queued", "pending_approval", "uncertain", "processed"] }
  })
    .sort({ updatedAt: 1 })
    .limit(limit);

  let checked = 0;
  for (const withdrawal of requests) {
    try {
      const payout = await razorpayX.fetchPayout(withdrawal.razorpayPayoutId);
      await finalizeWithdrawal(withdrawal, payout);
      checked += 1;
    } catch (error) {
      console.error(`[Payout Reconcile] ${withdrawal._id}:`, error.message);
    }
  }
  return { checked };
}

async function finalizeWithdrawalByPayout(payoutData) {
  const payoutId = String(payoutData?.id || "");
  const referenceId = String(payoutData?.reference_id || "");

  let withdrawal = payoutId
    ? await WithdrawalRequest.findOne({ razorpayPayoutId: payoutId })
    : null;

  if (!withdrawal && referenceId.startsWith("hmg_")) {
    const id = referenceId.slice(4);
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      withdrawal = await WithdrawalRequest.findById(id);
    }
  }

  if (!withdrawal) return null;

  const expectedPaise = Math.round(Number(withdrawal.amount) * 100);
  if (Number(payoutData?.amount) !== expectedPaise) {
    throw new Error("Payout webhook amount mismatch");
  }

  if (!withdrawal.razorpayPayoutId && payoutId) {
    withdrawal.razorpayPayoutId = payoutId;
    withdrawal.razorpayStatus = payoutData.status || "";
    await withdrawal.save();
  }

  return finalizeWithdrawal(withdrawal, payoutData);
}

async function getWalletSummary(driverId) {
  const driver = await User.findOne({ _id: driverId, role: "driver" }).select(
    "wallet payoutSettings driverProfile.bankDetails name phone email"
  );
  if (!driver) throw new Error("Driver nahi mila");

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayAgg, monthAgg, transactions, withdrawals] = await Promise.all([
    WalletTransaction.aggregate([
      { $match: { driver: driver._id, type: { $in: ["ride_online_credit", "ride_cash_earning"] }, createdAt: { $gte: dayStart } } },
      { $group: { _id: null, amount: { $sum: "$amount" } } }
    ]),
    WalletTransaction.aggregate([
      { $match: { driver: driver._id, type: { $in: ["ride_online_credit", "ride_cash_earning"] }, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, amount: { $sum: "$amount" } } }
    ]),
    WalletTransaction.find({ driver: driver._id }).sort({ createdAt: -1 }).limit(30).lean(),
    WithdrawalRequest.find({ driver: driver._id }).sort({ createdAt: -1 }).limit(20).lean()
  ]);

  const bank = driver.driverProfile?.bankDetails || {};
  const payoutReadiness = razorpayX.getConfigurationStatus();
  let payoutLiveAccess = { ok: false, message: "Live payout config incomplete" };
  if (payoutReadiness.ready) {
    try {
      await razorpayX.checkLiveAccess();
      payoutLiveAccess = { ok: true, message: "RazorpayX live API access verified" };
    } catch (error) {
      payoutLiveAccess = {
        ok: false,
        message: String(error?.message || "RazorpayX live API access failed").slice(0, 500)
      };
    }
  }

  return {
    wallet: driver.wallet || {},
    todayEarnings: money(todayAgg[0]?.amount),
    monthEarnings: money(monthAgg[0]?.amount),
    payoutsEnabled: payoutReadiness.ready && payoutLiveAccess.ok,
    payoutReadiness,
    payoutLiveAccess,
    savedPayout: {
      upiId: bank.upiId || "",
      bankName: bank.bankName || "",
      accountHolderName: bank.accountHolderName || "",
      maskedAccount: maskAccount(bank.accountNumber),
      ifsc: bank.ifscCode || "",
      preferredMethod: driver.payoutSettings?.preferredMethod || "upi"
    },
    payoutSettings: driver.payoutSettings || {},
    transactions,
    withdrawals
  };
}

function nextScheduleDate(frequency, from = new Date()) {
  const next = new Date(from);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  else if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  else next.setDate(next.getDate() + 7);
  next.setHours(10, 0, 0, 0);
  return next;
}

async function savePayoutSettings(driverId, payload) {
  const driver = await User.findOne({ _id: driverId, role: "driver" });
  if (!driver) throw new Error("Driver nahi mila");

  const method = payload.preferredMethod === "bank" ? "bank" : "upi";
  const bank = driver.driverProfile.bankDetails;
  const oldUpiId = String(bank.upiId || "").trim().toLowerCase();

  if (payload.upiId !== undefined) {
    const nextUpiId = String(payload.upiId || "").trim().toLowerCase();
    if (nextUpiId !== oldUpiId) bank.razorpayUpiFundAccountId = "";
    bank.upiId = nextUpiId;
  }
  if (payload.bankName !== undefined) bank.bankName = String(payload.bankName || "").trim();
  if (payload.accountHolderName !== undefined) bank.accountHolderName = String(payload.accountHolderName || "").trim();
  if (payload.accountNumber !== undefined && String(payload.accountNumber || "").trim()) {
    const newAccount = String(payload.accountNumber).trim();
    if (newAccount !== bank.accountNumber) bank.razorpayBankFundAccountId = "";
    bank.accountNumber = newAccount;
  }
  if (payload.ifsc !== undefined) {
    const nextIfsc = String(payload.ifsc || "").trim().toUpperCase();
    if (nextIfsc !== bank.ifscCode) bank.razorpayBankFundAccountId = "";
    bank.ifscCode = nextIfsc;
  }

  if (method === "upi") {
    const upi = String(bank.upiId || "").trim().toLowerCase();
    if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upi)) {
      throw new Error("Valid UPI ID save karo");
    }
  } else {
    const account = String(bank.accountNumber || "").trim();
    const ifsc = String(bank.ifscCode || "").trim().toUpperCase();
    if (!/^\d{6,20}$/.test(account)) throw new Error("Valid bank account number save karo");
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) throw new Error("Valid IFSC code save karo");
    if (!String(bank.accountHolderName || "").trim()) throw new Error("Account holder name required hai");
  }

  driver.payoutSettings.preferredMethod = method;
  driver.payoutSettings.autoPayoutEnabled = Boolean(payload.autoPayoutEnabled);
  driver.payoutSettings.autoPayoutFrequency = ["daily", "weekly", "monthly"].includes(payload.autoPayoutFrequency)
    ? payload.autoPayoutFrequency
    : "weekly";
  driver.payoutSettings.autoPayoutMinimum = Math.max(100, money(payload.autoPayoutMinimum || 500));
  driver.payoutSettings.nextScheduledPayoutAt = driver.payoutSettings.autoPayoutEnabled
    ? nextScheduleDate(driver.payoutSettings.autoPayoutFrequency)
    : null;

  await driver.save();
  return getWalletSummary(driverId);
}

async function processScheduledPayouts(limit = 20) {
  if (!razorpayX.isEnabled()) return { processed: 0 };

  const now = new Date();
  const drivers = await User.find({
    role: "driver",
    "payoutSettings.autoPayoutEnabled": true,
    "payoutSettings.nextScheduledPayoutAt": { $lte: now }
  }).limit(limit);

  let processed = 0;
  for (const driver of drivers) {
    const settings = driver.payoutSettings || {};
    const amount = money(driver.wallet?.balance);
    const minimum = money(settings.autoPayoutMinimum || 500);
    try {
      if (amount >= minimum) {
        await requestWithdrawal({
          driverId: driver._id,
          amount,
          method: settings.preferredMethod || "upi",
          destination: {},
          source: "scheduled"
        });
        processed += 1;
      }
    } catch (error) {
      console.error(`[Auto Payout] driver=${driver._id}:`, error.message);
    } finally {
      await User.findByIdAndUpdate(driver._id, {
        $set: {
          "payoutSettings.lastScheduledPayoutAt": now,
          "payoutSettings.nextScheduledPayoutAt": nextScheduleDate(settings.autoPayoutFrequency || "weekly", now)
        }
      });
    }
  }
  return { processed };
}

module.exports = {
  settleRidePayment,
  requestWithdrawal,
  retryUncertainPayouts,
  reconcilePendingPayouts,
  finalizeWithdrawalByPayout,
  getWalletSummary,
  savePayoutSettings,
  processScheduledPayouts,
  nextScheduleDate
};
