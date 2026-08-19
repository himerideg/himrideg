const Booking = require("../models/Booking");
const User = require("../models/User");
const WalletLedger = require("../models/WalletLedger");

function sameId(first, second) {
  if (!first || !second) return false;
  return String(first?._id || first) === String(second?._id || second);
}

function finalFareOf(booking) {
  return Number(
    booking?.finalFare ??
      booking?.fare?.finalFare ??
      0
  );
}

function commissionOf(booking) {
  const fare = finalFareOf(booking);
  const percent = Number(
    booking?.platformCommissionPercent ?? 10
  );
  return Math.max(0, Math.round((fare * percent) / 100));
}

function driverPayableOf(booking) {
  const fare = finalFareOf(booking);
  return Math.max(0, fare - commissionOf(booking));
}

function ensurePaymentAccess(booking, user, options = {}) {
  const role = String(user?.role || "").toLowerCase();
  const userId = user?._id || user?.id;

  if (role === "admin") return true;

  if (role === "customer" && sameId(booking.customer, userId)) {
    return true;
  }

  if (
    options.allowAssignedDriver &&
    role === "driver" &&
    sameId(booking.driver, userId)
  ) {
    return true;
  }

  const error = new Error("Aap is booking ke payment data access nahi kar sakte");
  error.statusCode = 403;
  throw error;
}

function syncPaymentFields(booking, {
  method,
  status,
  transactionId,
  paidAt
} = {}) {
  if (method) {
    booking.paymentMethod = method;
    booking.payment.method = method;
  }

  if (status) {
    booking.paymentStatus = status;
    booking.payment.status = status;
  }

  if (transactionId !== undefined) {
    booking.payment.transactionId = transactionId || "";
  }

  if (method === "online") {
    booking.payment.gateway = "razorpay";
  }

  if (paidAt !== undefined) {
    booking.paidAt = paidAt;
    booking.payment.paidAt = paidAt;
  }

  const fare = finalFareOf(booking);
  const commission = commissionOf(booking);
  const driverPayable = driverPayableOf(booking);

  booking.platformCommissionAmount = commission;
  booking.driverPayableAmount = driverPayable;

  if (booking.fare) {
    booking.fare.finalFare = fare;
    booking.fare.platformFee = commission;
  }

  return {
    fare,
    commission,
    driverPayable
  };
}

async function createLedgerOnce(payload) {
  try {
    const ledger = await WalletLedger.create(payload);
    return {
      created: true,
      ledger
    };
  } catch (error) {
    if (error?.code === 11000) {
      const ledger = await WalletLedger.findOne({
        idempotencyKey: payload.idempotencyKey
      });
      return {
        created: false,
        ledger
      };
    }
    throw error;
  }
}

function basicAuthHeader() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay API keys configured nahi hain");
    error.statusCode = 503;
    throw error;
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function createRouteTransfer({
  paymentId,
  linkedAccountId,
  amountPaise,
  bookingId,
  driverId
}) {
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/transfers`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        transfers: [
          {
            account: linkedAccountId,
            amount: amountPaise,
            currency: "INR",
            on_hold: false,
            notes: {
              bookingId: String(bookingId),
              driverId: String(driverId),
              platform: "HimRideG"
            }
          }
        ]
      })
    }
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      body?.error?.description ||
        body?.error?.reason ||
        `Razorpay Route transfer failed (${response.status})`
    );
    error.statusCode = 502;
    error.gatewayBody = body;
    throw error;
  }

  const transfer =
    body?.items?.[0] ||
    body?.transfers?.[0] ||
    body;

  return transfer;
}

async function settleOnlinePayment(booking, options = {}) {
  const populatedBooking = await Booking.findById(booking._id)
    .populate("driver", "name phone driverProfile wallet isOnline isAvailable")
    .populate("customer", "name phone email");

  if (!populatedBooking?.driver) {
    populatedBooking.settlementStatus = "pending";
    populatedBooking.settlementError = "Driver assigned nahi hai";
    await populatedBooking.save();
    return {
      status: "pending",
      reason: "driver_not_assigned"
    };
  }

  const driver = populatedBooking.driver;
  const driverPayable = driverPayableOf(populatedBooking);
  const paymentId =
    populatedBooking.razorpayPaymentId ||
    options.paymentId ||
    "";

  const idempotencyKey = `online:${populatedBooking._id}:${paymentId || "paid"}`;
  const existingLedger = await WalletLedger.findOne({ idempotencyKey });

  if (existingLedger) {
    return {
      status: populatedBooking.settlementStatus || "transferred",
      reference: existingLedger.reference || populatedBooking.settlementReference || "",
      idempotent: true
    };
  }

  const linkedAccountId = String(
    driver?.driverProfile?.razorpayLinkedAccountId || ""
  ).trim();

  if (!linkedAccountId) {
    populatedBooking.settlementStatus = "pending";
    populatedBooking.settlementError =
      "Driver Razorpay Route linked account configured nahi hai";
    await populatedBooking.save();

    return {
      status: "pending",
      reason: "route_account_missing"
    };
  }

  if (!paymentId) {
    populatedBooking.settlementStatus = "pending";
    populatedBooking.settlementError = "Razorpay payment ID missing hai";
    await populatedBooking.save();

    return {
      status: "pending",
      reason: "payment_id_missing"
    };
  }

  populatedBooking.settlementStatus = "pending";
  populatedBooking.settlementError = "";
  await populatedBooking.save();

  try {
    const transfer = await createRouteTransfer({
      paymentId,
      linkedAccountId,
      amountPaise: Math.round(driverPayable * 100),
      bookingId: populatedBooking._id,
      driverId: driver._id
    });

    const reference = String(
      transfer?.id || transfer?.transfer_id || ""
    );

    await createLedgerOnce({
      driver: driver._id,
      booking: populatedBooking._id,
      type: "online_transfer",
      amount: driverPayable,
      direction: "info",
      balanceBefore: Number(driver.wallet?.balance || 0),
      balanceAfter: Number(driver.wallet?.balance || 0),
      idempotencyKey,
      reference,
      note: "Online ride share Razorpay Route se driver linked account ko transfer",
      metadata: {
        paymentId,
        linkedAccountId
      }
    });

    await User.updateOne(
      { _id: driver._id, role: "driver" },
      {
        $inc: {
          "wallet.totalEarned": driverPayable,
          "wallet.totalOnlineTransferred": driverPayable
        }
      }
    );

    populatedBooking.settlementStatus = "transferred";
    populatedBooking.settlementReference = reference;
    populatedBooking.settlementError = "";
    populatedBooking.settledAt = new Date();
    await populatedBooking.save();

    return {
      status: "transferred",
      reference,
      transfer
    };
  } catch (error) {
    populatedBooking.settlementStatus = "failed";
    populatedBooking.settlementError = String(error.message || "Transfer failed").slice(0, 1000);
    await populatedBooking.save();

    return {
      status: "failed",
      reason: error.message
    };
  }
}

async function settleCashCommission(booking) {
  const populatedBooking = await Booking.findById(booking._id)
    .populate("driver", "name phone wallet isOnline isAvailable driverProfile");

  if (!populatedBooking?.driver) {
    const error = new Error("Assigned driver nahi mila");
    error.statusCode = 409;
    throw error;
  }

  const driver = populatedBooking.driver;
  const commission = commissionOf(populatedBooking);
  const idempotencyKey = `cash:${populatedBooking._id}:commission`;

  const existingLedger = await WalletLedger.findOne({ idempotencyKey });
  if (existingLedger) {
    return {
      idempotent: true,
      commission,
      balanceAfter: existingLedger.balanceAfter,
      commissionDue: Math.max(
        Number(driver.wallet?.commissionDue || 0),
        Number(driver.wallet?.cashCommissionDue || 0)
      ),
      settlementStatus: populatedBooking.settlementStatus
    };
  }

  const currentBalance = Number(driver.wallet?.balance || 0);
  const debit = Math.min(currentBalance, commission);
  const shortfall = Math.max(0, commission - debit);
  const balanceAfter = Math.max(0, currentBalance - debit);

  const ledgerType = shortfall > 0
    ? "cash_commission_due"
    : "cash_commission_debit";

  const ledgerResult = await createLedgerOnce({
    driver: driver._id,
    booking: populatedBooking._id,
    type: ledgerType,
    amount: commission,
    direction: "debit",
    balanceBefore: currentBalance,
    balanceAfter,
    idempotencyKey,
    note:
      shortfall > 0
        ? `Cash commission me ₹${shortfall} due raha`
        : "Cash ride platform commission wallet se debit",
    metadata: {
      debit,
      shortfall
    }
  });

  if (ledgerResult.created) {
    const update = {
      $inc: {
        "wallet.balance": -debit,
        "wallet.totalCommissionPaid": debit,
        "wallet.totalEarned": driverPayableOf(populatedBooking)
      },
      $set: {
        lastSeenAt: new Date()
      }
    };

    if (shortfall > 0) {
      update.$inc["wallet.commissionDue"] = shortfall;
      update.$inc["wallet.cashCommissionDue"] = shortfall;
      update.$set.isAvailable = false;
    }

    await User.updateOne(
      { _id: driver._id, role: "driver" },
      update
    );
  }

  populatedBooking.settlementStatus =
    shortfall > 0
      ? "cash_commission_due"
      : "cash_commission_debited";
  populatedBooking.settlementReference = ledgerResult.ledger?._id?.toString() || "";
  populatedBooking.settlementError = shortfall > 0
    ? `₹${shortfall} commission due`
    : "";
  populatedBooking.settledAt = new Date();
  await populatedBooking.save();

  return {
    idempotent: !ledgerResult.created,
    commission,
    debit,
    shortfall,
    balanceAfter,
    settlementStatus: populatedBooking.settlementStatus
  };
}

module.exports = {
  sameId,
  finalFareOf,
  commissionOf,
  driverPayableOf,
  ensurePaymentAccess,
  syncPaymentFields,
  settleOnlinePayment,
  settleCashCommission
};
