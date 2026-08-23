const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");
const walletService = require("../services/walletService");

const PLATFORM_COMMISSION_PERCENT = 10;
const DRIVER_SHARE_PERCENT = 100 - PLATFORM_COMMISSION_PERCENT;

const getFare = (booking) =>
  Number(booking?.finalFare ?? booking?.fare?.finalFare ?? 0) || 0;

function paymentPlanOf(booking) {
  const plan = String(booking?.paymentPlan || "").trim();
  if (["online_after_ride", "advance", "scheduled"].includes(plan)) return plan;
  if (booking?.paymentTiming === "pay_now") return "advance";
  return null;
}

function canPayOnlineNow(booking) {
  /*
  | HARD MONEY GATE:
  | - payment only after driver completes the ride
  | - amount only final locked fare
  | Legacy advance/scheduled fields are preserved as data, but they cannot
  | bypass this server-side completed-ride gate.
  */
  const fareLocked =
    booking?.fareStatus === "fare_accepted" &&
    getFare(booking) > 0;

  if (!fareLocked) return false;

  return String(booking?.status || "") === "completed";
}

function canSettleDriverNow(booking) {
  return String(booking?.status || "") === "completed";
}

function getCustomerId(booking) {
  return String(
    booking.customer?._id ||
      booking.customer ||
      booking.user?._id ||
      booking.user ||
      ""
  );
}

function getDriverId(booking) {
  return String(booking.driver?._id || booking.driver || "");
}

function ensureOwner(req, booking) {
  if (
    req.user?.role === "customer" &&
    getCustomerId(booking) &&
    getCustomerId(booking) !== String(req.user._id)
  ) {
    const error = new Error("Aap is booking ka payment nahi kar sakte");
    error.statusCode = 403;
    throw error;
  }
}

function syncEmbeddedPayment(booking) {
  if (!booking.payment) booking.payment = {};
  booking.payment.method = booking.paymentMethod;
  booking.payment.status = booking.paymentStatus;
  booking.payment.transactionId = booking.razorpayPaymentId || "";
  booking.payment.gateway = booking.paymentMethod === "online" ? "razorpay" : "cash";
  booking.payment.paidAt = booking.paidAt || null;
}

function realMoneyMode() {
  return String(process.env.REAL_MONEY_MODE || "false").toLowerCase() === "true";
}

function ensureLivePaymentConfig() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay live keys server par configure nahi hain");
    error.statusCode = 503;
    throw error;
  }
  if (realMoneyMode() && !String(process.env.RAZORPAY_KEY_ID).startsWith("rzp_live_")) {
    const error = new Error("REAL_MONEY_MODE me rzp_live_ Razorpay key required hai");
    error.statusCode = 503;
    throw error;
  }
}

async function applyCapturedPayment(booking, paymentEntity, { signature = "" } = {}) {
  if (!booking) throw new Error("Booking nahi mili");
  if (!canPayOnlineNow(booking)) {
    const error = new Error("Is ride stage/payment plan par online payment allowed nahi hai");
    error.statusCode = 400;
    throw error;
  }

  const fare = getFare(booking);
  const expectedPaise = Math.round(fare * 100);
  const orderId = String(paymentEntity?.order_id || "");
  const paymentId = String(paymentEntity?.id || "");
  const status = String(paymentEntity?.status || "").toLowerCase();
  const currency = String(paymentEntity?.currency || "").toUpperCase();
  const amount = Number(paymentEntity?.amount);

  if (!booking.razorpayOrderId || booking.razorpayOrderId !== orderId) {
    const error = new Error("Razorpay Order ID match nahi hui");
    error.statusCode = 400;
    throw error;
  }
  if (!paymentId) {
    const error = new Error("Razorpay Payment ID missing hai");
    error.statusCode = 400;
    throw error;
  }
  if (currency !== "INR" || amount !== expectedPaise) {
    const error = new Error("Razorpay payment amount/currency booking fare se match nahi karti");
    error.statusCode = 400;
    throw error;
  }
  if (status !== "captured") {
    const error = new Error(`Payment captured nahi hai. Current status: ${status || "unknown"}`);
    error.statusCode = 409;
    throw error;
  }

  if (booking.paymentStatus === "paid") {
    if (booking.razorpayPaymentId && booking.razorpayPaymentId !== paymentId) {
      const error = new Error("Booking kisi doosri payment se already paid hai");
      error.statusCode = 409;
      throw error;
    }
    if (canSettleDriverNow(booking)) {
      await walletService.settleRidePayment(booking._id);
    }
    return booking;
  }

  const commissionPercent = PLATFORM_COMMISSION_PERCENT;
  booking.platformCommissionPercent = PLATFORM_COMMISSION_PERCENT;
  booking.platformCommissionAmount =
    Math.round(((fare * commissionPercent) / 100) * 100) / 100;
  booking.driverPayableAmount =
    Math.max(0, fare - booking.platformCommissionAmount);
  booking.paymentMethod = "online";
  booking.paymentStatus = "paid";
  booking.razorpayOrderId = orderId;
  booking.razorpayPaymentId = paymentId;
  if (signature) booking.razorpaySignature = signature;
  booking.paidAt = paymentEntity?.created_at
    ? new Date(Number(paymentEntity.created_at) * 1000)
    : new Date();
  booking.paymentFailedAt = null;
  booking.paymentFailureReason = "";
  syncEmbeddedPayment(booking);
  await booking.save();

  if (canSettleDriverNow(booking)) {
    await walletService.settleRidePayment(booking._id);
  }
  return booking;
}

function paymentError(res, error, fallback) {
  const status = Number(error?.statusCode) || 500;
  console.error(fallback, error);
  return res.status(status).json({
    success: false,
    message:
      error?.error?.description ||
      error?.razorpay?.error?.description ||
      error?.message ||
      fallback
  });
}

exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID required hai" });

    ensureLivePaymentConfig();

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });
    ensureOwner(req, booking);

    if (!canPayOnlineNow(booking)) {
      return res.status(400).json({
        success: false,
        message: "Final fare lock/payment plan ke hisaab se Pay Now abhi available nahi hai"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Is booking ka payment pehle hi ho chuka hai" });
    }

    const fare = getFare(booking);
    if (!Number.isFinite(fare) || fare <= 0) {
      return res.status(400).json({
        success: false,
        message: "Final fare valid nahi hai — driver/customer fare lock check karo"
      });
    }

    const amountInPaise = Math.round(fare * 100);
    const receipt = `ride_${String(booking._id).slice(-12)}_${Date.now().toString().slice(-8)}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: String(booking._id),
        customerId: String(req.user?._id || ""),
        paymentPlan: paymentPlanOf(booking) || "online_after_ride",
        paymentContext: "post_ride",
        platformCommissionPercent: String(PLATFORM_COMMISSION_PERCENT),
        driverWalletSharePercent: String(DRIVER_SHARE_PERCENT),
        settlementMode: "driver_earnings_wallet"
      }
    });

    booking.paymentMethod = "online";
    booking.paymentStatus = "pending";
    booking.razorpayOrderId = order.id;
    booking.paymentFailureReason = "";
    booking.paymentFailedAt = null;
    booking.paymentAttemptCount = Number(booking.paymentAttemptCount || 0) + 1;
    syncEmbeddedPayment(booking);
    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay payment ready hai",
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking._id,
        fare,
        customerName: req.user?.name || "Customer",
        customerPhone: req.user?.phone || "",
        customerEmail: req.user?.email || "",
        paymentPlan: paymentPlanOf(booking),
        paymentContext: "post_ride",
        platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
        driverSharePercent: DRIVER_SHARE_PERCENT
      }
    });
  } catch (error) {
    return paymentError(res, error, "Payment order create nahi ho saka");
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    ensureLivePaymentConfig();

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification details incomplete hain" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });
    ensureOwner(req, booking);

    if (!canPayOnlineNow(booking)) {
      return res.status(400).json({ success: false, message: "Is ride stage/payment plan par payment verify nahi ho sakta" });
    }

    if (!booking.razorpayOrderId || booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Razorpay Order ID match nahi hui" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${booking.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(String(razorpay_signature), "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const isValid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

    if (!isValid) {
      booking.paymentStatus = "failed";
      booking.paymentFailedAt = new Date();
      booking.paymentFailureReason = "Payment signature invalid";
      syncEmbeddedPayment(booking);
      await booking.save();
      return res.status(400).json({
        success: false,
        message: "Payment signature invalid hai — payment verify nahi hui"
      });
    }

    const fare = getFare(booking);
    const expectedPaise = Math.round(fare * 100);

    let payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (String(payment?.order_id || "") !== booking.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Fetched payment ki Order ID mismatch hai" });
    }
    if (Number(payment?.amount) !== expectedPaise || String(payment?.currency || "").toUpperCase() !== "INR") {
      return res.status(400).json({ success: false, message: "Fetched payment amount booking fare se match nahi karti" });
    }

    // Real money me authorized payment ko captured kiye bina driver wallet credit nahi hoga.
    if (String(payment?.status || "").toLowerCase() === "authorized") {
      try {
        payment = await razorpay.payments.capture(
          razorpay_payment_id,
          expectedPaise,
          "INR"
        );
      } catch (captureError) {
        // Concurrent auto-capture ho sakta hai; final status Razorpay se dobara fetch karo.
        payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (String(payment?.status || "").toLowerCase() !== "captured") {
          throw captureError;
        }
      }
    }

    const wasAlreadyPaid = booking.paymentStatus === "paid";

    await applyCapturedPayment(booking, payment, { signature: razorpay_signature });

    // Native/web driver clients use the same production Socket.IO server.
    // Emit once only when this verification actually transitions the ride to paid.
    if (!wasAlreadyPaid) {
      const io = req.app.get("io");
      const driverId = getDriverId(booking);

      if (io && driverId) {
        io.to(`driver:${driverId}`).emit("payment:success", {
          bookingId: String(booking._id),
          fare,
          amount: fare,
          paymentMethod: "online",
          paymentStatus: "paid",
          paymentId: booking.razorpayPaymentId,
          paidAt: booking.paidAt
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment captured aur successfully verify ho gayi! 🎉",
      data: {
        bookingId: booking._id,
        paymentStatus: "paid",
        paymentMethod: "online",
        paymentId: booking.razorpayPaymentId,
        paidAt: booking.paidAt,
        fare,
        platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
        platformCommission: booking.platformCommissionAmount,
        driverSharePercent: DRIVER_SHARE_PERCENT,
        driverPayable: booking.driverPayableAmount,
        walletSettlementStatus: booking.walletSettlementStatus || "not_settled"
      }
    });
  } catch (error) {
    return paymentError(res, error, "Payment verify nahi ho saka");
  }
};

exports.markPaymentFailed = async (req, res) => {
  try {
    const { bookingId, reason = "Payment attempt failed" } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID required hai" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });
    ensureOwner(req, booking);

    if (booking.paymentStatus !== "paid") {
      booking.paymentStatus = "failed";
      booking.paymentFailedAt = new Date();
      booking.paymentFailureReason = String(reason || "Payment failed").slice(0, 500);
      syncEmbeddedPayment(booking);
      await booking.save();
    }

    return res.status(200).json({ success: true, message: "Payment failure record ho gaya" });
  } catch (error) {
    return paymentError(res, error, "Payment failure record nahi ho saka");
  }
};

exports.selectCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID required hai" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });
    ensureOwner(req, booking);

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Cash payment ride complete hone ke baad select karo" });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Payment already complete hai" });
    }

    booking.paymentMethod = "cash";
    booking.paymentStatus = "pending";
    booking.cashSelectedAt = new Date();
    booking.paymentChoiceAfterRide = "cash";
    booking.paymentFailureReason = "";
    syncEmbeddedPayment(booking);
    await booking.save();

    const io = req.app.get("io");
    const driverId = getDriverId(booking);
    if (io && driverId) {
      // Driver already joins driver:<id>; one room = one cash alert (no duplicate popup).
      const cashSelectedPayload = {
        bookingId: String(booking._id),
        fare: getFare(booking),
        paymentMethod: "cash",
        paymentStatus: "pending",
        paymentChoiceAfterRide: "cash",
        cashSelectedAt: booking.cashSelectedAt,
        message: "Customer ne cash payment select ki hai. Cash receive karke confirm karein."
      };

      io.to(`driver:${driverId}`).emit(
        "payment:cash-selected",
        cashSelectedPayload
      );

      const customerId = getCustomerId(booking);
      if (customerId) {
        io.to(`user:${customerId}`).emit(
          "payment:cash-selected",
          cashSelectedPayload
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cash selected. Driver cash receive karke confirm karega.",
      data: {
        bookingId: booking._id,
        paymentMethod: "cash",
        paymentStatus: "pending",
        paymentChoiceAfterRide: "cash",
        cashSelectedAt: booking.cashSelectedAt,
        fare: getFare(booking)
      }
    });
  } catch (error) {
    return paymentError(res, error, "Cash payment select nahi ho saka");
  }
};

exports.confirmCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID required hai" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });

    if (!["driver", "admin"].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: "Sirf assigned driver/admin cash confirm kar sakta hai" });
    }
    if (req.user.role === "driver" && getDriverId(booking) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Ye ride aapko assigned nahi hai" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Ride complete hone ke baad cash confirm karo" });
    }

    if (booking.paymentStatus === "paid") {
      await walletService.settleRidePayment(booking._id);
      return res.status(200).json({
        success: true,
        message: "Cash payment already confirmed hai",
        data: {
          bookingId: booking._id,
          paymentStatus: "paid",
          paymentMethod: booking.paymentMethod,
          fare: getFare(booking),
          driverPayable: booking.driverPayableAmount
        }
      });
    }

    const cashWasSelected = Boolean(
      booking.cashSelectedAt ||
      String(booking.paymentChoiceAfterRide || "").toLowerCase() === "cash"
    );

    if (!cashWasSelected) {
      return res.status(409).json({
        success: false,
        message: "Customer ne abhi cash payment select nahi ki hai"
      });
    }

    const fare = getFare(booking);
    if (!fare || fare <= 0) {
      return res.status(400).json({ success: false, message: "Final fare valid nahi hai" });
    }

    const commissionPercent = PLATFORM_COMMISSION_PERCENT;
    const commissionAmount =
      Math.round(((fare * commissionPercent) / 100) * 100) / 100;
    booking.platformCommissionPercent = PLATFORM_COMMISSION_PERCENT;
    booking.paymentMethod = "cash";
    booking.paymentChoiceAfterRide = "cash";
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.platformCommissionAmount = commissionAmount;
    booking.driverPayableAmount = Math.max(0, fare - commissionAmount);
    booking.paymentFailureReason = "";
    syncEmbeddedPayment(booking);
    await booking.save();

    await walletService.settleRidePayment(booking._id);

    const io = req.app.get("io");
    const customerId = getCustomerId(booking);
    if (io && customerId) {
      io.to(`user:${customerId}`).emit("payment:confirmed", {
        bookingId: String(booking._id),
        paymentMethod: "cash",
        paymentStatus: "paid",
        fare,
        amount: fare,
        paidAt: booking.paidAt,
        message: "Cash Payment Successful"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cash payment confirm ho gaya! ✅",
      data: {
        bookingId: booking._id,
        paymentStatus: "paid",
        paymentMethod: "cash",
        paidAt: booking.paidAt,
        fare,
        commission: booking.platformCommissionAmount,
        platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
        driverSharePercent: DRIVER_SHARE_PERCENT,
        driverPayable: booking.driverPayableAmount,
        walletSettlementStatus: booking.walletSettlementStatus || "not_settled"
      }
    });
  } catch (error) {
    return paymentError(res, error, "Cash payment confirm nahi ho saka");
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).select(
      "customer driver payment paymentMethod paymentStatus paymentChoiceAfterRide razorpayOrderId razorpayPaymentId paidAt paymentFailedAt paymentFailureReason paymentAttemptCount cashSelectedAt finalFare driverOfferedFare estimatedFare fare platformCommissionAmount driverPayableAmount walletSettlementStatus walletSettledAt status"
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });

    const uid = String(req.user?._id || "");
    if (
      req.user?.role !== "admin" &&
      uid !== getCustomerId(booking) &&
      uid !== getDriverId(booking)
    ) {
      return res.status(403).json({ success: false, message: "Payment status access denied" });
    }

    return res.status(200).json({
      success: true,
      data: { ...booking.toObject(), fareAmount: getFare(booking) }
    });
  } catch (error) {
    return paymentError(res, error, "Payment status nahi mil saka");
  }
};

exports.getPaymentReceipt = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select("-razorpaySignature")
      .populate("customer", "name phone email")
      .populate("driver", "name phone");
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili" });

    const uid = String(req.user?._id || "");
    if (
      req.user?.role !== "admin" &&
      uid !== getCustomerId(booking) &&
      uid !== getDriverId(booking)
    ) {
      return res.status(403).json({ success: false, message: "Receipt access denied" });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Is booking ka payment abhi tak complete nahi hua" });
    }

    return res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        rideId: String(booking._id).slice(-8).toUpperCase(),
        customer: booking.customer,
        driver: booking.driver,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        fare: getFare(booking),
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.razorpayPaymentId || null,
        paidAt: booking.paidAt,
        platformCommission: booking.platformCommissionAmount,
        driverPayable: booking.driverPayableAmount,
        completedAt: booking.completedAt
      }
    });
  } catch (error) {
    return paymentError(res, error, "Payment receipt nahi mil saki");
  }
};

exports.applyCapturedPayment = applyCapturedPayment;
