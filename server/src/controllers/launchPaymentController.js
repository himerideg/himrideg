const crypto = require("crypto");
const Booking = require("../models/Booking");
const razorpay = require("../config/razorpay");
const {
  ensurePaymentAccess,
  finalFareOf,
  syncPaymentFields,
  settleOnlinePayment,
  settleCashCommission,
  sameId
} = require("../services/paymentSettlementService");

function userId(req) {
  return req.user?._id || req.user?.id || null;
}

function paymentTimingOf(booking) {
  return booking?.paymentTiming === "pay_now"
    ? "pay_now"
    : "pay_later";
}

function isFareLocked(booking) {
  return (
    booking?.fareStatus === "fare_accepted" &&
    finalFareOf(booking) > 0
  );
}

function requireCustomerOwner(booking, req) {
  if (
    req.user?.role !== "customer" ||
    !sameId(booking.customer, userId(req))
  ) {
    const error = new Error(
      "Sirf booking customer online payment start kar sakta hai"
    );
    error.statusCode = 403;
    throw error;
  }
}

function canPayOnlineNow(booking) {
  if (!isFareLocked(booking)) {
    return {
      allowed: false,
      message: "Driver final fare customer accept kare tabhi payment ho sakti hai"
    };
  }

  const timing = paymentTimingOf(booking);

  if (timing === "pay_now") {
    if (
      ["cancelled", "expired", "completed"].includes(
        String(booking.status || "")
      )
    ) {
      if (booking.status === "completed") {
        return {
          allowed: true
        };
      }

      return {
        allowed: false,
        message: "Cancelled/expired ride ka online payment nahi ho sakta"
      };
    }

    return {
      allowed: true
    };
  }

  if (booking.status !== "completed") {
    return {
      allowed: false,
      message: "Pay Later ride ka payment ride complete hone ke baad hoga"
    };
  }

  return {
    allowed: true
  };
}

async function createPaymentOrder(req, res) {
  try {
    const bookingId = String(req.body?.bookingId || "").trim();

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID required hai"
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("customer", "name phone email")
      .populate("driver", "name phone driverProfile");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    requireCustomerOwner(booking, req);

    if (booking.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment pehle hi complete hai",
        data: {
          alreadyPaid: true,
          bookingId: booking._id,
          paymentId: booking.razorpayPaymentId || null,
          fare: finalFareOf(booking)
        }
      });
    }

    const gate = canPayOnlineNow(booking);
    if (!gate.allowed) {
      return res.status(409).json({
        success: false,
        message: gate.message
      });
    }

    const fare = finalFareOf(booking);
    const amountInPaise = Math.round(fare * 100);

    const receipt =
      `HRG_${booking._id.toString().slice(-10)}_${Date.now().toString().slice(-8)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        customerId: String(booking.customer?._id || booking.customer || ""),
        driverId: String(booking.driver?._id || booking.driver || ""),
        paymentTiming: paymentTimingOf(booking)
      }
    });

    booking.razorpayOrderId = order.id;
    booking.paymentChoiceAfterRide = "online";

    syncPaymentFields(booking, {
      method: "online",
      status: "pending",
      transactionId: order.id,
      paidAt: null
    });

    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay payment order ready hai",
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking._id,
        fare,
        paymentTiming: paymentTimingOf(booking),
        customerName: booking.customer?.name || req.user?.name || "Customer",
        customerPhone: booking.customer?.phone || req.user?.phone || ""
      }
    });
  } catch (error) {
    console.error("Launch create payment order error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error?.error?.description ||
        error.message ||
        "Payment order create nahi ho saka"
    });
  }
}

async function verifyPayment(req, res) {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details incomplete hain"
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    requireCustomerOwner(booking, req);

    if (
      booking.paymentStatus === "paid" &&
      booking.razorpayPaymentId === razorpay_payment_id
    ) {
      const settlement = await settleOnlinePayment(booking, {
        paymentId: razorpay_payment_id
      });

      return res.status(200).json({
        success: true,
        message: "Payment pehle hi verify hai",
        data: {
          bookingId: booking._id,
          paymentStatus: "paid",
          paymentMethod: "online",
          settlement
        }
      });
    }

    if (
      booking.razorpayOrderId &&
      booking.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay Order ID match nahi hui"
      });
    }

    const secret = String(process.env.RAZORPAY_KEY_SECRET || "");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(String(razorpay_signature), "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    const valid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

    if (!valid) {
      syncPaymentFields(booking, {
        method: "online",
        status: "failed"
      });
      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature invalid hai"
      });
    }

    const paidAt = new Date();
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    const amounts = syncPaymentFields(booking, {
      method: "online",
      status: "paid",
      transactionId: razorpay_payment_id,
      paidAt
    });

    await booking.save();

    const settlement = await settleOnlinePayment(booking, {
      paymentId: razorpay_payment_id
    });

    return res.status(200).json({
      success: true,
      message: "Payment successfully verify ho gayi",
      data: {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        paymentMethod: "online",
        paymentId: booking.razorpayPaymentId,
        paidAt,
        fare: amounts.fare,
        platformCommission: amounts.commission,
        driverPayable: amounts.driverPayable,
        settlement
      }
    });
  } catch (error) {
    console.error("Launch verify payment error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Payment verify nahi ho saka"
    });
  }
}

async function confirmCashPayment(req, res) {
  try {
    const bookingId = String(req.body?.bookingId || "").trim();

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID required hai"
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    if (
      req.user?.role !== "admin" &&
      !(
        req.user?.role === "driver" &&
        sameId(booking.driver, userId(req))
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Sirf assigned driver ya admin cash payment confirm kar sakta hai"
      });
    }

    if (paymentTimingOf(booking) === "pay_now") {
      return res.status(409).json({
        success: false,
        message: "Pay Now booking me cash payment allowed nahi hai"
      });
    }

    if (booking.status !== "completed") {
      return res.status(409).json({
        success: false,
        message: "Cash payment ride complete hone ke baad confirm hogi"
      });
    }

    if (!isFareLocked(booking)) {
      return res.status(409).json({
        success: false,
        message: "Final fare lock nahi hai"
      });
    }

    if (booking.paymentStatus === "paid") {
      if (booking.paymentMethod !== "cash") {
        return res.status(409).json({
          success: false,
          message: "Ride ka online payment already paid hai"
        });
      }

      const settlement = await settleCashCommission(booking);
      return res.status(200).json({
        success: true,
        message: "Cash payment already confirmed hai",
        data: {
          bookingId: booking._id,
          paymentStatus: "paid",
          paymentMethod: "cash",
          settlement
        }
      });
    }

    booking.paymentChoiceAfterRide = "cash";
    const paidAt = new Date();
    const amounts = syncPaymentFields(booking, {
      method: "cash",
      status: "paid",
      transactionId: `cash_${booking._id}`,
      paidAt
    });

    await booking.save();

    const settlement = await settleCashCommission(booking);

    return res.status(200).json({
      success: true,
      message: "Cash received confirm ho gaya",
      data: {
        bookingId: booking._id,
        paymentStatus: "paid",
        paymentMethod: "cash",
        paidAt,
        fare: amounts.fare,
        platformCommission: amounts.commission,
        driverPayable: amounts.driverPayable,
        settlement
      }
    });
  } catch (error) {
    console.error("Launch cash confirm error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Cash payment confirm nahi ho saka"
    });
  }
}

async function getPaymentStatus(req, res) {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select(
        "customer driver payment paymentMethod paymentStatus paymentTiming paymentChoiceAfterRide razorpayOrderId razorpayPaymentId paidAt finalFare fare fareStatus platformCommissionAmount driverPayableAmount settlementStatus settlementReference settlementError settledAt status"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    ensurePaymentAccess(booking, req.user, {
      allowAssignedDriver: true
    });

    return res.status(200).json({
      success: true,
      data: {
        ...booking.toObject(),
        fare: finalFareOf(booking)
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Payment status nahi mil saka"
    });
  }
}

async function getPaymentReceipt(req, res) {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select("-razorpaySignature")
      .populate("customer", "name phone email")
      .populate("driver", "name phone driverProfile");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    ensurePaymentAccess(booking, req.user, {
      allowAssignedDriver: true
    });

    if (booking.paymentStatus !== "paid") {
      return res.status(409).json({
        success: false,
        message: "Is booking ka payment abhi paid nahi hai"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        receiptNumber: `HRG-${booking._id.toString().slice(-8).toUpperCase()}`,
        bookingId: booking._id,
        customer: booking.customer,
        driver: booking.driver,
        pickup: booking.pickup?.address || booking.pickupAddress || "",
        dropoff: booking.dropoff?.address || booking.dropAddress || "",
        fare: finalFareOf(booking),
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        paymentTiming: paymentTimingOf(booking),
        paymentId: booking.razorpayPaymentId || null,
        paidAt: booking.paidAt,
        platformCommission: booking.platformCommissionAmount,
        driverPayable: booking.driverPayableAmount,
        settlementStatus: booking.settlementStatus,
        settlementReference: booking.settlementReference,
        rideDate: booking.createdAt
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Receipt nahi mil saka"
    });
  }
}

async function retrySettlement(req, res) {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Sirf admin settlement retry kar sakta hai"
      });
    }

    if (
      booking.paymentStatus !== "paid" ||
      booking.paymentMethod !== "online"
    ) {
      return res.status(409).json({
        success: false,
        message: "Sirf paid online booking ka settlement retry ho sakta hai"
      });
    }

    const settlement = await settleOnlinePayment(booking, {
      paymentId: booking.razorpayPaymentId
    });

    return res.status(200).json({
      success: true,
      data: {
        settlement
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Settlement retry nahi hua"
    });
  }
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = String(process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const received = Buffer.from(String(signature || ""), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    received.length === expectedBuffer.length &&
    crypto.timingSafeEqual(received, expectedBuffer)
  );
}

async function razorpayWebhook(req, res) {
  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(req.body || "");

    const signature = req.headers["x-razorpay-signature"];

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay webhook signature"
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8") || "{}");
    const event = String(payload?.event || "");
    const entity = payload?.payload?.payment?.entity || {};
    const paymentId = String(entity?.id || "");
    const orderId = String(entity?.order_id || "");

    if (!orderId && !paymentId) {
      return res.status(200).json({
        success: true,
        ignored: true
      });
    }

    const booking = await Booking.findOne({
      $or: [
        ...(orderId ? [{ razorpayOrderId: orderId }] : []),
        ...(paymentId ? [{ razorpayPaymentId: paymentId }] : [])
      ]
    });

    if (!booking) {
      return res.status(200).json({
        success: true,
        ignored: true,
        message: "Booking webhook mapping nahi mili"
      });
    }

    if (event === "payment.failed") {
      if (booking.paymentStatus !== "paid") {
        syncPaymentFields(booking, {
          method: "online",
          status: "failed",
          transactionId: paymentId || orderId
        });
        booking.settlementError =
          entity?.error_description ||
          entity?.error_reason ||
          "Razorpay payment failed";
        await booking.save();
      }

      return res.status(200).json({
        success: true
      });
    }

    if (event === "payment.captured" || event === "order.paid") {
      if (booking.paymentStatus !== "paid") {
        booking.razorpayOrderId = orderId || booking.razorpayOrderId;
        booking.razorpayPaymentId = paymentId || booking.razorpayPaymentId;

        syncPaymentFields(booking, {
          method: "online",
          status: "paid",
          transactionId: paymentId || orderId,
          paidAt: new Date()
        });
        await booking.save();
      }

      await settleOnlinePayment(booking, {
        paymentId: paymentId || booking.razorpayPaymentId
      });
    }

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook process nahi hua"
    });
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  confirmCashPayment,
  getPaymentStatus,
  getPaymentReceipt,
  retrySettlement,
  razorpayWebhook
};
