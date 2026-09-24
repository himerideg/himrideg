const Booking = require("../models/Booking");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const DriverPayoutMethod = require("../models/DriverPayoutMethod");
const RideAutoPayout = require("../models/RideAutoPayout");
const walletService = require("./walletService");
const {
  getPlainMethodData,
  migrateDriverMethods,
  scrubLegacyUserPayoutDetails
} = require("./payoutDataProtectionService");

/*
|--------------------------------------------------------------------------
| Ride Auto Payout Watermark
|--------------------------------------------------------------------------
| Old completed rides ko kabhi retroactively payout nahi karna. Service boot
| ke baad settle hone wali rides hi auto payout queue me aayengi.
*/
const PROCESS_STARTED_AT = new Date();

function enabled() {
  return String(process.env.AUTO_PRIMARY_PAYOUT_ENABLED || "false")
    .trim()
    .toLowerCase() === "true";
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n)
    ? Math.max(0, Math.round(n * 100) / 100)
    : 0;
}

function methodDestination(method, secret) {
  if (!method || !secret) return null;

  if (method.type === "upi") {
    const upiId = String(secret.upiId || "")
      .trim()
      .toLowerCase();
    if (!upiId) return null;
    return { method: "upi", destination: { upiId } };
  }

  const accountHolderName = String(
    secret.accountHolderName || ""
  ).trim();
  const bankName = String(secret.bankName || "").trim();
  const accountNumber = String(secret.accountNumber || "")
    .replace(/\s+/g, "");
  const ifsc = String(secret.ifsc || "")
    .trim()
    .toUpperCase();

  if (!accountHolderName || !accountNumber || !ifsc) return null;

  return {
    method: "bank",
    destination: {
      accountHolderName,
      bankName,
      accountNumber,
      ifsc
    }
  };
}

async function reserveTrackingRecord(booking) {
  try {
    return await RideAutoPayout.create({
      booking: booking._id,
      driver: booking.driver,
      amount: 0,
      status: "pending"
    });
  } catch (error) {
    if (error?.code === 11000) {
      return RideAutoPayout.findOne({ booking: booking._id });
    }
    throw error;
  }
}

async function processOne(booking) {
  const tracking = await reserveTrackingRecord(booking);
  if (!tracking) return { handled: false };

  if (
    [
      "submitted",
      "processed",
      "wallet_only",
      "manual_override"
    ].includes(tracking.status)
  ) {
    return { handled: true, status: tracking.status };
  }

  if (tracking.attempts >= 3 && tracking.status === "failed") {
    tracking.status = "wallet_only";
    tracking.reason =
      "Auto payout 3 baar fail hua; amount wallet me safe hai aur manual Withdraw available hai.";
    tracking.nextRetryAt = null;
    await tracking.save();
    return { handled: true, status: tracking.status };
  }

  const now = new Date();
  if (tracking.nextRetryAt && tracking.nextRetryAt > now) {
    return { handled: true, status: "waiting_retry" };
  }

  await migrateDriverMethods(booking.driver);

  const [ledger, primary, driver] = await Promise.all([
    WalletTransaction.findOne({
      booking: booking._id,
      type: "ride_online_credit"
    }).lean(),
    DriverPayoutMethod.findOne({
      driver: booking.driver,
      isPrimary: true
    }),
    User.findOne({
      _id: booking.driver,
      role: "driver"
    }).select("wallet")
  ]);

  if (!ledger) {
    tracking.status = "failed";
    tracking.attempts += 1;
    tracking.lastAttemptAt = now;
    tracking.nextRetryAt = new Date(
      now.getTime() + 5 * 60 * 1000
    );
    tracking.reason =
      "Ride wallet ledger abhi ready nahi hai; safe retry scheduled hai.";
    await tracking.save();
    return { handled: true, status: tracking.status };
  }

  if (!primary) {
    tracking.status = "wallet_only";
    tracking.reason =
      "Primary payout account save nahi hai; earning wallet me safe rakhi gayi.";
    tracking.nextRetryAt = null;
    await tracking.save();
    return { handled: true, status: tracking.status };
  }

  const secret = await getPlainMethodData(primary);
  const payoutTarget = methodDestination(primary, secret);

  if (!payoutTarget) {
    tracking.status = "wallet_only";
    tracking.payoutMethod = primary._id;
    tracking.reason =
      "Primary payout account secure data incomplete hai; earning wallet me safe rakhi gayi.";
    tracking.nextRetryAt = null;
    await tracking.save();
    return { handled: true, status: tracking.status };
  }

  /*
  | Ledger metadata.walletCredit old cash commission recovery ko already
  | account karta hai. Isi exact credited amount ko payout karo; final fare ya
  | gross earning ko dobara calculate karke over-payout nahi karna.
  */
  const amount = money(ledger?.metadata?.walletCredit);

  if (amount < 100) {
    tracking.status = "wallet_only";
    tracking.amount = amount;
    tracking.payoutMethod = primary._id;
    tracking.reason =
      "Auto payout amount ₹100 minimum se kam hai; earning wallet me available rahegi.";
    tracking.nextRetryAt = null;
    await tracking.save();
    return { handled: true, status: tracking.status };
  }

  if (!driver || money(driver.wallet?.balance) < amount) {
    tracking.status = "manual_override";
    tracking.amount = amount;
    tracking.payoutMethod = primary._id;
    tracking.reason =
      "Wallet balance already use/withdraw ho chuka hai; old ride ke liye duplicate auto payout nahi kiya.";
    tracking.nextRetryAt = null;
    await tracking.save();
    return { handled: true, status: tracking.status };
  }

  tracking.status = "processing";
  tracking.amount = amount;
  tracking.payoutMethod = primary._id;
  tracking.attempts += 1;
  tracking.lastAttemptAt = now;
  tracking.reason = "";
  await tracking.save();

  try {
    const withdrawal = await walletService.requestWithdrawal({
      driverId: booking.driver,
      amount,
      method: payoutTarget.method,
      destination: payoutTarget.destination,
      source: "instant"
    });

    tracking.withdrawal = withdrawal?._id || null;
    tracking.status = withdrawal?.status === "processed"
      ? "processed"
      : "submitted";
    tracking.nextRetryAt = null;
    tracking.reason = withdrawal?.status === "uncertain"
      ? "RazorpayX response uncertain hai; existing payout reconciliation duplicate payment ko prevent karega."
      : "Primary payout account ko ride earning submit ho gayi.";
    await tracking.save();

    return {
      handled: true,
      status: tracking.status,
      amount
    };
  } catch (error) {
    const message = String(
      error?.message || "Auto payout failed"
    ).slice(0, 1000);

    tracking.status = /insufficient wallet balance/i.test(message)
      ? "manual_override"
      : "failed";
    tracking.reason = message;
    tracking.nextRetryAt =
      tracking.status === "failed" && tracking.attempts < 3
        ? new Date(Date.now() + 60 * 60 * 1000)
        : null;
    await tracking.save();

    return {
      handled: true,
      status: tracking.status,
      error: message
    };
  } finally {
    await scrubLegacyUserPayoutDetails(booking.driver).catch(() => {});
  }
}

async function processPrimaryRideAutoPayouts(limit = 10) {
  if (!enabled()) {
    return { enabled: false, scanned: 0, processed: 0 };
  }

  const bookings = await Booking.find({
    paymentMethod: "online",
    paymentStatus: "paid",
    status: "completed",
    walletSettlementStatus: "settled",
    driver: { $ne: null },
    walletSettledAt: { $gte: PROCESS_STARTED_AT }
  })
    .select("_id driver walletSettledAt")
    .sort({ walletSettledAt: 1 })
    .limit(Math.max(1, Number(limit) || 10));

  let processed = 0;

  for (const booking of bookings) {
    try {
      const result = await processOne(booking);
      if (result?.handled) processed += 1;
    } catch (error) {
      console.error(
        `[Primary Ride Auto Payout] booking=${booking._id}:`,
        error?.message || error
      );
    }
  }

  return {
    enabled: true,
    scanned: bookings.length,
    processed
  };
}

module.exports = {
  processPrimaryRideAutoPayouts
};
