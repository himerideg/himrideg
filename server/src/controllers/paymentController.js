const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");
const User = require("../models/User");
const walletService = require("../services/walletService");
const { sendPushToUser } = require("../services/pushNotificationService");
const {
  commissionBreakdown,
  commissionPolicyForBooking
} = require("../utils/commissionPolicy");

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

/*
|--------------------------------------------------------------------------
| ADD-ONLY: paid ride driver release
|--------------------------------------------------------------------------
| Payment status PAID hote hi driver ko next ride ke liye release karo.
| Wallet settlement separate/idempotent rahega; availability ko customer aur
| driver ke mutual acknowledgement par block nahi karna. Online driver hi
| available hota hai; offline driver ka currentRide clear hota hai but woh
| offline hi rehta hai.
*/
async function releaseDriverAfterPaidBooking(booking) {
  if (!booking || String(booking.status || "").toLowerCase() !== "completed") return;
  if (String(booking.paymentStatus || "").toLowerCase() !== "paid") return;

  const driverId = getDriverId(booking);
  if (!driverId) return;

  await User.updateOne(
    {
      _id: driverId,
      role: "driver",
      currentRide: booking._id,
      isOnline: true
    },
    {
      $set: {
        currentRide: null,
        isAvailable: true,
        lastSeenAt: new Date()
      }
    }
  );

  await User.updateOne(
    {
      _id: driverId,
      role: "driver",
      currentRide: booking._id,
      isOnline: { $ne: true }
    },
    {
      $set: {
        currentRide: null,
        isAvailable: false,
        lastSeenAt: new Date()
      }
    }
  );
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

const LEGACY_CASH_CONFIRMATION_CUTOFF =
  new Date("2026-08-23T07:30:00.000Z").getTime();

function isLegacyCashPendingBooking(booking) {
  if (!booking) return false;

  if (String(booking.status || "").toLowerCase() !== "completed") {
    return false;
  }

  if (String(booking.paymentStatus || "pending").toLowerCase() === "paid") {
    return false;
  }

  if (String(booking.paymentMethod || "").toLowerCase() !== "cash") {
    return false;
  }

  if (
    booking.cashSelectedAt ||
    String(booking.paymentChoiceAfterRide || "").trim()
  ) {
    return false;
  }

  const legacyTime = new Date(
    booking.completedAt ||
      booking.updatedAt ||
      booking.createdAt ||
      0
  ).getTime();

  return (
    Number.isFinite(legacyTime) &&
    legacyTime > 0 &&
    legacyTime <= LEGACY_CASH_CONFIRMATION_CUTOFF
  );
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

  const commissionData = commissionBreakdown(fare, booking);
  const commissionPercent = commissionData.commissionPercent;
  booking.platformCommissionPercent = commissionPercent;
  booking.platformCommissionAmount = commissionData.platformCommission;
  booking.driverPayableAmount = commissionData.driverPayable;
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

  // ADD-ONLY: verified customer payment itself releases the completed ride.
  await releaseDriverAfterPaidBooking(booking);

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

    const commissionPolicy = commissionPolicyForBooking(booking);
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
        platformCommissionPercent: String(commissionPolicy.commissionPercent),
        driverWalletSharePercent: String(commissionPolicy.driverSharePercent),
        rideDistanceKm: String(commissionPolicy.distanceKm),
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
        platformCommissionPercent: commissionPolicy.commissionPercent,
        driverSharePercent: commissionPolicy.driverSharePercent,
        rideDistanceKm: commissionPolicy.distanceKm
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
        const paymentPayload = {
          bookingId: String(booking._id),
          fare,
          amount: fare,
          paymentMethod: "online",
          paymentStatus: "paid",
          paymentId: booking.razorpayPaymentId,
          paidAt: booking.paidAt
        };

        io.to(`driver:${driverId}`).emit("payment:success", paymentPayload);
        io.to(`driver:${driverId}`).emit("payment:completed", paymentPayload);

        const customerId = getCustomerId(booking);
        if (customerId) {
          io.to(`user:${customerId}`).emit("payment:completed", paymentPayload);
        }
      }

      const customerId = getCustomerId(booking);
      const pushData = {
        type: "payment_success",
        bookingId: String(booking._id),
        paymentMethod: "online",
        paymentStatus: "paid",
        fare
      };

      if (customerId) {
        sendPushToUser(customerId, {
          title: "Payment Successful ✅",
          body: `₹${fare} online payment successful ho gayi.`,
          data: { ...pushData, soundEvent: "online_payment_success", role: "customer" }
        }).catch(() => {});
      }

      if (driverId) {
        sendPushToUser(driverId, {
          title: `Payment Received ₹${fare}`,
          body: "Customer ki online payment successfully receive ho gayi.",
          data: { ...pushData, soundEvent: "payment_received_driver", role: "driver" }
        }).catch(() => {});
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
        platformCommissionPercent: Number(booking.platformCommissionPercent),
        platformCommission: booking.platformCommissionAmount,
        driverSharePercent: 100 - Number(booking.platformCommissionPercent),
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

    if (driverId) {
      const fare = getFare(booking);
      sendPushToUser(driverId, {
        title: "Cash Payment Selected",
        body: `Customer ne ₹${fare} cash select kiya. Cash receive karke confirm karein.`,
        data: {
          type: "cash_selected",
          soundEvent: "cash_selected",
          role: "driver",
          bookingId: String(booking._id),
          fare,
          paymentMethod: "cash",
          paymentStatus: "pending"
        }
      }).catch(() => {});
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

    const actorRole = String(req.user?.role || "").toLowerCase();
    const actorId = String(req.user?._id || "");
    // Customer may select Cash Payment, but only the assigned driver can
    // confirm that physical cash was actually received. Admin remains an
    // emergency/manual recovery authority.
    const customerOwnsRide = false;
    const assignedDriver =
      actorRole === "driver" &&
      getDriverId(booking) === actorId;
    const adminActor = actorRole === "admin";

    if (!assignedDriver && !adminActor) {
      return res.status(403).json({
        success: false,
        code: "DRIVER_CASH_CONFIRMATION_REQUIRED",
        message: "Cash payment ko sirf assigned driver Cash Received confirm karke Paid kar sakta hai"
      });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Ride complete hone ke baad cash confirm karo" });
    }

    if (booking.paymentStatus === "paid") {
      await releaseDriverAfterPaidBooking(booking);
      await walletService.settleRidePayment(booking._id);
      return res.status(200).json({
        success: true,
        message: "Payment already complete hai — driver release ho chuka hai",
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

    const legacyCashPending =
      isLegacyCashPendingBooking(booking);

    if (!cashWasSelected && !legacyCashPending) {
      return res.status(409).json({
        success: false,
        code: "CASH_NOT_SELECTED",
        message: "Customer ko pehle Cash Payment select karna hoga; uske baad assigned driver Cash Received confirm karega"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DRIVER-AUTHORITATIVE CASH RULE
    |--------------------------------------------------------------------------
    | Customer Cash Payment select karta hai. Payment pending hi rehti hai.
    | Physical cash receive hone ke baad assigned driver Cash Received confirm
    | karta hai; tabhi payment Paid hoti hai aur driver next ride ke liye
    | release hota hai. Customer-side confirmation payment ko Paid nahi kar sakti.
    |--------------------------------------------------------------------------
    */

    if (legacyCashPending) {
      booking.cashSelectedAt = booking.cashSelectedAt || new Date();
      booking.paymentChoiceAfterRide = "cash";
    }

    const fare = getFare(booking);
    if (!fare || fare <= 0) {
      return res.status(400).json({ success: false, message: "Final fare valid nahi hai" });
    }

    const commissionData = commissionBreakdown(fare, booking);
    const commissionPercent = commissionData.commissionPercent;
    const commissionAmount = commissionData.platformCommission;
    booking.platformCommissionPercent = commissionPercent;
    booking.paymentMethod = "cash";
    booking.paymentChoiceAfterRide = "cash";
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.platformCommissionAmount = commissionAmount;
    booking.driverPayableAmount = commissionData.driverPayable;
    booking.paymentFailureReason = "";
    syncEmbeddedPayment(booking);
    await booking.save();

    // Assigned driver Cash Received confirmation is the payment authority.
    await releaseDriverAfterPaidBooking(booking);
    await walletService.settleRidePayment(booking._id);

    const io = req.app.get("io");
    const customerId = getCustomerId(booking);
    if (io && customerId) {
      const cashPaymentPayload = {
        bookingId: String(booking._id),
        paymentMethod: "cash",
        paymentStatus: "paid",
        fare,
        amount: fare,
        paidAt: booking.paidAt,
        confirmedBy: actorRole,
        message: "Assigned driver confirmed Cash Received"
      };

      io.to(`user:${customerId}`).emit("payment:confirmed", cashPaymentPayload);
      io.to(`user:${customerId}`).emit("payment:completed", cashPaymentPayload);

      const assignedDriverId = getDriverId(booking);
      if (assignedDriverId) {
        io.to(`driver:${assignedDriverId}`).emit("payment:completed", cashPaymentPayload);
      }
    }

    const driverId = getDriverId(booking);
    const pushData = {
      type: "payment_success",
      bookingId: String(booking._id),
      paymentMethod: "cash",
      paymentStatus: "paid",
      fare
    };

    if (customerId) {
      sendPushToUser(customerId, {
        title: "Cash Payment Successful ✅",
        body: `Driver ne ₹${fare} cash received confirm kar diya.`,
        data: { ...pushData, soundEvent: "cash_payment_success", role: "customer" }
      }).catch(() => {});
    }

    if (driverId) {
      sendPushToUser(driverId, {
        title: `Payment Received ₹${fare}`,
        body: "Cash payment successfully confirm ho gayi. Ab aap next ride le sakte hain.",
        data: { ...pushData, soundEvent: "payment_received_driver", role: "driver" }
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Cash payment confirm ho gaya! Driver release ho gaya. ✅",
      data: {
        bookingId: booking._id,
        paymentStatus: "paid",
        paymentMethod: "cash",
        paidAt: booking.paidAt,
        fare,
        commission: booking.platformCommissionAmount,
        platformCommissionPercent: Number(booking.platformCommissionPercent),
        driverSharePercent: 100 - Number(booking.platformCommissionPercent),
        driverPayable: booking.driverPayableAmount,
        walletSettlementStatus: booking.walletSettlementStatus || "not_settled"
      }
    });
  } catch (error) {
    return paymentError(res, error, "Cash payment confirm nahi ho saka");
  }
};

exports.rejectLegacyAdvancePayment = async (req, res) => {
  return res.status(409).json({
    success: false,
    code: "ADVANCE_PAYMENT_DISABLED",
    message: "Advance payment abhi disabled hai. Ride complete hone ke baad Pay Online ya Cash Payment use karein."
  });
};

exports.confirmOnlinePaymentReceipt = async (req, res) => {
  try {
    const { bookingId } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID required hai" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking nahi mili" });
    }

    const actorRole = String(req.user?.role || "").toLowerCase();
    const actorId = String(req.user?._id || "");
    const assignedDriver = actorRole === "driver" && getDriverId(booking) === actorId;
    const adminActor = actorRole === "admin";

    if (!assignedDriver && !adminActor) {
      return res.status(403).json({
        success: false,
        message: "Sirf assigned driver ya admin online receipt status confirm kar sakta hai"
      });
    }

    if (String(booking.paymentStatus || "").toLowerCase() !== "paid" ||
        String(booking.paymentMethod || "").toLowerCase() !== "online") {
      return res.status(409).json({
        success: false,
        message: "Online payment abhi server par verified paid nahi hai"
      });
    }

    // Backward compatibility only: Razorpay verification is already authoritative.
    await releaseDriverAfterPaidBooking(booking);
    if (canSettleDriverNow(booking)) {
      await walletService.settleRidePayment(booking._id);
    }

    return res.status(200).json({
      success: true,
      message: "Online payment already verified hai",
      data: {
        bookingId: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        paidAt: booking.paidAt,
        fare: getFare(booking)
      }
    });
  } catch (error) {
    return paymentError(res, error, "Online payment receipt confirm nahi ho saka");
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
