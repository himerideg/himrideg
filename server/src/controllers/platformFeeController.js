const crypto = require("crypto");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");
const User = require("../models/User");
const WalletLedger = require("../models/WalletLedger");
const {
  PLATFORM_FEE_BLOCK_THRESHOLD,
  feeDueOf
} = require("../middlewares/platformFeeGate");

function driverId(req) {
  return req.user?._id || req.user?.id;
}

function requireDriver(req) {
  if (req.user?.role !== "driver") {
    const error = new Error("Sirf driver platform fee access kar sakta hai");
    error.statusCode = 403;
    throw error;
  }
}

function money(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(0, Math.round(number * 100) / 100)
    : 0;
}

function livePaymentReady() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  );
}

function statusPayload(driver) {
  const due = money(feeDueOf(driver?.wallet));
  return {
    due,
    threshold: PLATFORM_FEE_BLOCK_THRESHOLD,
    blocked: due >= PLATFORM_FEE_BLOCK_THRESHOLD,
    canAcceptRides: due < PLATFORM_FEE_BLOCK_THRESHOLD,
    reminderRequired: due > 0,
    paymentReady: livePaymentReady(),
    totalCommissionPaid: money(driver?.wallet?.totalCommissionPaid || 0)
  };
}

async function loadDriver(req, session = null) {
  let query = User.findOne({
    _id: driverId(req),
    role: "driver"
  }).select("name phone wallet isOnline isAvailable currentRide");

  if (session) query = query.session(session);
  const driver = await query;

  if (!driver) {
    const error = new Error("Driver account nahi mila");
    error.statusCode = 404;
    throw error;
  }

  return driver;
}

exports.getPlatformFeeStatus = async (req, res) => {
  try {
    requireDriver(req);
    const driver = await loadDriver(req);

    return res.status(200).json({
      success: true,
      data: statusPayload(driver)
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Platform fee status load nahi hua"
    });
  }
};

exports.createPlatformFeeOrder = async (req, res) => {
  try {
    requireDriver(req);

    if (!livePaymentReady()) {
      return res.status(503).json({
        success: false,
        message: "Platform fee payment ke liye Razorpay live payment setup ready nahi hai"
      });
    }

    const driver = await loadDriver(req);
    const current = statusPayload(driver);

    if (current.due <= 0) {
      return res.status(409).json({
        success: false,
        code: "NO_PLATFORM_FEE_DUE",
        message: "Aapki HimRideG platform fee already clear hai",
        data: current
      });
    }

    /*
    | Exact outstanding amount server decides. Client cannot lower the fee.
    | Minimum gateway amount ₹1; any paise-level excess is safely credited to
    | the driver's internal balance during verified settlement.
    */
    const payable = Math.max(1, current.due);
    const amountPaise = Math.round(payable * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `PF_${String(driver._id).slice(-10)}_${Date.now().toString().slice(-8)}`.slice(0, 40),
      notes: {
        purpose: "himrideg_platform_fee",
        driverId: String(driver._id),
        dueAtOrder: String(current.due),
        threshold: String(PLATFORM_FEE_BLOCK_THRESHOLD)
      }
    });

    return res.status(201).json({
      success: true,
      message: "Platform fee payment ready hai",
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        platformFeeAmount: payable,
        dueBefore: current.due,
        driverName: driver.name || "HimRideG Driver",
        driverPhone: driver.phone || ""
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Platform fee order create nahi hua"
    });
  }
};

exports.verifyPlatformFee = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Platform fee verification details incomplete hain"
    });
  }

  let session = null;

  try {
    requireDriver(req);

    if (!livePaymentReady()) {
      throw Object.assign(
        new Error("Razorpay live payment setup ready nahi hai"),
        { statusCode: 503 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", String(process.env.RAZORPAY_KEY_SECRET))
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(String(razorpay_signature), "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return res.status(400).json({
        success: false,
        message: "Platform fee payment signature invalid hai"
      });
    }

    const [order, initialPayment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id)
    ]);

    if (
      String(order?.notes?.purpose || "") !== "himrideg_platform_fee" ||
      String(order?.notes?.driverId || "") !== String(driverId(req))
    ) {
      return res.status(403).json({
        success: false,
        message: "Platform fee order is driver account se match nahi karta"
      });
    }

    if (String(initialPayment?.order_id || "") !== String(order?.id || "")) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment/order mismatch hai"
      });
    }

    let payment = initialPayment;
    const expectedPaise = Number(order?.amount || 0);

    if (
      Number(payment?.amount || 0) !== expectedPaise ||
      String(payment?.currency || "").toUpperCase() !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Platform fee payment amount/currency mismatch hai"
      });
    }

    if (String(payment?.status || "").toLowerCase() === "authorized") {
      try {
        payment = await razorpay.payments.capture(
          razorpay_payment_id,
          expectedPaise,
          "INR"
        );
      } catch (captureError) {
        payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (String(payment?.status || "").toLowerCase() !== "captured") {
          throw captureError;
        }
      }
    }

    if (String(payment?.status || "").toLowerCase() !== "captured") {
      return res.status(409).json({
        success: false,
        message: `Platform fee payment captured nahi hai. Status: ${payment?.status || "unknown"}`
      });
    }

    const paidAmount = money(expectedPaise / 100);
    const idempotencyKey = `platformfee:${razorpay_payment_id}`;
    let result = null;

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const existing = await WalletLedger.findOne({ idempotencyKey }).session(session);
      const driver = await loadDriver(req, session);

      if (existing) {
        result = {
          idempotent: true,
          applied: money(existing?.metadata?.commissionDueCleared || 0),
          walletCredit: money(existing?.metadata?.walletCredit || 0),
          status: statusPayload(driver)
        };
        return;
      }

      const dueBefore = money(feeDueOf(driver.wallet));
      const applied = Math.min(dueBefore, paidAmount);
      const walletCredit = money(paidAmount - applied);

      driver.wallet.commissionDue = money(
        Math.max(0, Number(driver.wallet?.commissionDue || 0) - applied)
      );
      driver.wallet.cashCommissionDue = money(
        Math.max(0, Number(driver.wallet?.cashCommissionDue || 0) - applied)
      );
      driver.wallet.totalCommissionPaid = money(
        Number(driver.wallet?.totalCommissionPaid || 0) + applied
      );
      driver.wallet.balance = money(
        Number(driver.wallet?.balance || 0) + walletCredit
      );
      driver.wallet.lastSettledAt = new Date();

      const dueAfter = feeDueOf(driver.wallet);
      if (
        dueAfter < PLATFORM_FEE_BLOCK_THRESHOLD &&
        driver.isOnline &&
        !driver.currentRide
      ) {
        driver.isAvailable = true;
      }

      await driver.save({ session });

      await WalletLedger.create(
        [
          {
            driver: driver._id,
            type: "wallet_topup",
            amount: paidAmount,
            direction: "credit",
            balanceBefore: money(Number(driver.wallet.balance || 0) - walletCredit),
            balanceAfter: money(driver.wallet.balance || 0),
            idempotencyKey,
            reference: razorpay_payment_id,
            note: `HimRideG platform fee ₹${applied.toFixed(2)} paid${walletCredit > 0 ? `; ₹${walletCredit.toFixed(2)} extra wallet credit` : ""}`,
            metadata: {
              purpose: "platform_fee",
              razorpayOrderId: razorpay_order_id,
              commissionDueBefore: dueBefore,
              commissionDueCleared: applied,
              walletCredit,
              threshold: PLATFORM_FEE_BLOCK_THRESHOLD
            }
          }
        ],
        { session }
      );

      result = {
        idempotent: false,
        applied,
        walletCredit,
        status: statusPayload(driver)
      };
    });

    return res.status(200).json({
      success: true,
      message:
        result?.status?.blocked
          ? `₹${result.applied.toFixed(0)} platform fee paid. ₹${Math.ceil(result.status.due)} abhi due hai.`
          : "Platform fee payment successful ✅ Ab aap ride accept kar sakte hain.",
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Platform fee verify nahi hui"
    });
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};
