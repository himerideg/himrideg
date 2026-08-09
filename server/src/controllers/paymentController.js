const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");

/*
|--------------------------------------------------------------------------
| Helper: Booking ka fare nikalna
|--------------------------------------------------------------------------
*/
const getFare = (booking) =>
  Number(
    booking.finalFare ||
    booking.driverOfferedFare ||
    booking.fare?.totalFare ||
    booking.estimatedFare ||
    0
  );

/*
|--------------------------------------------------------------------------
| Create Razorpay Order
| POST /api/v2/payments/create-order
|--------------------------------------------------------------------------
*/
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

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

    // Security: customer sirf apni booking ka payment kare
    const bookingCustomerId =
      booking.customer?._id?.toString() ||
      booking.customer?.toString() ||
      booking.user?._id?.toString() ||
      booking.user?.toString();

    if (
      req.user?.role === "customer" &&
      bookingCustomerId &&
      bookingCustomerId !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Aap is booking ka payment nahi kar sakte"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Is booking ka payment pehle hi ho chuka hai"
      });
    }

    // Ride complete honi chahiye
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment sirf completed ride ke liye ho sakta hai"
      });
    }

    const fare = getFare(booking);

    if (!fare || fare <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking fare valid nahi hai — driver ne fare confirm nahi kiya"
      });
    }

    // Razorpay amount paise mein hota hai (₹1 = 100 paise)
    const amountInPaise = Math.round(fare * 100);

    const receipt = `ride_${booking._id
      .toString()
      .slice(-12)}_${Date.now().toString().slice(-8)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        customerId: req.user?._id?.toString() || ""
      }
    });

    booking.paymentMethod = "online";
    booking.paymentStatus = "pending";
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Payment order create ho gaya",
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        bookingId: booking._id,
        fare,
        customerName: req.user?.name || "Customer",
        customerPhone: req.user?.phone || ""
      }
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error.message ||
        "Payment order create nahi ho saka"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Verify Razorpay Payment
| POST /api/v2/payments/verify
|--------------------------------------------------------------------------
*/
exports.verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

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

    if (
      booking.razorpayOrderId &&
      booking.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay Order ID match nahi hui"
      });
    }

    // Signature verify karo
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    const isValid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

    if (!isValid) {
      booking.paymentStatus = "failed";
      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature invalid hai — payment verify nahi hui"
      });
    }

    // Payment success — booking update karo
    booking.paymentMethod = "online";
    booking.paymentStatus = "paid";
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();

    // Commission calculate karo
    const fare = getFare(booking);
    const commissionPercent = booking.platformCommissionPercent || 10;
    booking.platformCommissionAmount = Math.round((fare * commissionPercent) / 100);
    booking.driverPayableAmount = fare - booking.platformCommissionAmount;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment successfully verify ho gayi! 🎉",
      data: {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        paymentMethod: "online",
        paymentId: booking.razorpayPaymentId,
        paidAt: booking.paidAt,
        fare,
        driverPayable: booking.driverPayableAmount
      }
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verify nahi ho saka"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Cash Payment Confirm
| POST /api/v2/payments/cash-confirm
|--------------------------------------------------------------------------
| Driver confirm karta hai ki customer ne cash de diya
*/
exports.confirmCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

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

    // Sirf driver ya admin cash confirm kar sakta hai
    if (
      req.user?.role !== "driver" &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Sirf driver cash payment confirm kar sakta hai"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Is booking ka payment already ho chuka hai"
      });
    }

    const fare = getFare(booking);

    // Commission calculate
    const commissionPercent = booking.platformCommissionPercent || 10;
    const commissionAmount = Math.round((fare * commissionPercent) / 100);

    booking.paymentMethod = "cash";
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.platformCommissionAmount = commissionAmount;
    booking.driverPayableAmount = fare - commissionAmount;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Cash payment confirm ho gaya! ✅",
      data: {
        bookingId: booking._id,
        paymentStatus: "paid",
        paymentMethod: "cash",
        paidAt: booking.paidAt,
        fare,
        driverPayable: booking.driverPayableAmount
      }
    });
  } catch (error) {
    console.error("Cash payment confirm error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Cash payment confirm nahi ho saka"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Payment Status
| GET /api/v2/payments/:bookingId/status
|--------------------------------------------------------------------------
*/
exports.getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).select(
      "paymentMethod paymentStatus razorpayOrderId razorpayPaymentId paidAt finalFare driverOfferedFare estimatedFare platformCommissionAmount driverPayableAmount status"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...booking.toObject(),
        fare: getFare(booking)
      }
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment status nahi mil saka"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Payment Receipt
| GET /api/v2/payments/:bookingId/receipt
|--------------------------------------------------------------------------
*/
exports.getPaymentReceipt = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select("-razorpaySignature")
      .populate("customer", "name phone email")
      .populate("driver", "name phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking nahi mili"
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Is booking ka payment abhi tak nahi hua"
      });
    }

    const fare = getFare(booking);

    return res.status(200).json({
      success: true,
      data: {
        receiptNumber: `HRG-${booking._id.toString().slice(-8).toUpperCase()}`,
        bookingId: booking._id,
        customer: booking.customer,
        driver: booking.driver,
        pickup: booking.pickup?.address || booking.pickupAddress || "",
        dropoff: booking.dropoff?.address || booking.dropAddress || "",
        fare,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.razorpayPaymentId || null,
        paidAt: booking.paidAt,
        platformCommission: booking.platformCommissionAmount,
        driverPayable: booking.driverPayableAmount,
        rideDate: booking.createdAt
      }
    });
  } catch (error) {
    console.error("Get receipt error:", error);
    return res.status(500).json({
      success: false,
      message: "Receipt nahi mil saka"
    });
  }
};
