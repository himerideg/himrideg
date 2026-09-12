const Booking = require("../models/Booking");
const DriverPayoutMethod = require("../models/DriverPayoutMethod");
const DirectDriverPayment = require("../models/DirectDriverPayment");
const walletService = require("../services/walletService");
const {
  getPlainMethodData,
  maskUpi
} = require("../services/payoutDataProtectionService");
const { sendPushToUser } = require("../services/pushNotificationService");

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

function fareOf(booking) {
  return Math.max(
    0,
    Number(
      booking?.finalFare ??
        booking?.fare?.finalFare ??
        0
    ) || 0
  );
}

function ensureCompletedUnpaid(booking) {
  if (!booking) {
    const error = new Error("Booking nahi mili");
    error.statusCode = 404;
    throw error;
  }

  if (String(booking.status || "").toLowerCase() !== "completed") {
    const error = new Error("Driver ko direct payment ride complete hone ke baad hi available hai");
    error.statusCode = 409;
    throw error;
  }

  if (String(booking.paymentStatus || "pending").toLowerCase() === "paid") {
    const error = new Error("Is ride ka payment already complete hai");
    error.statusCode = 409;
    throw error;
  }

  if (fareOf(booking) <= 0) {
    const error = new Error("Final locked fare valid nahi hai");
    error.statusCode = 409;
    throw error;
  }
}

function ensureCustomerOwner(req, booking) {
  if (
    req.user?.role !== "customer" ||
    idOf(booking?.customer) !== idOf(req.user?._id)
  ) {
    const error = new Error("Aap is ride ka driver payment access nahi kar sakte");
    error.statusCode = 403;
    throw error;
  }
}

function ensureAssignedDriver(req, booking) {
  if (
    req.user?.role !== "driver" ||
    idOf(booking?.driver) !== idOf(req.user?._id)
  ) {
    const error = new Error("Ye ride aapko assigned nahi hai");
    error.statusCode = 403;
    throw error;
  }
}

async function findDriverUpiMethod(driverId) {
  const methods = await DriverPayoutMethod.find({
    driver: driverId,
    type: "upi"
  }).sort({ isPrimary: -1, createdAt: 1 });

  for (const method of methods) {
    const secret = await getPlainMethodData(method);
    const upiId = String(secret?.upiId || "").trim().toLowerCase();
    if (upiId) return { method, upiId };
  }

  return null;
}

function upiUrl({ upiId, payeeName, amount, booking }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName || "HimRideG Driver",
    am: Number(amount || 0).toFixed(2),
    cu: "INR",
    tn: `HimRideG ride ${booking?.bookingNumber || idOf(booking)}`
  });
  return `upi://pay?${params.toString()}`;
}

exports.getDirectDriverPaymentDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("driver", "name profileImage")
      .populate("customer", "name");

    ensureCustomerOwner(req, booking);
    ensureCompletedUnpaid(booking);

    const driverId = idOf(booking.driver);
    if (!driverId) {
      return res.status(409).json({
        success: false,
        message: "Assigned driver nahi mila"
      });
    }

    const found = await findDriverUpiMethod(driverId);
    if (!found) {
      return res.status(404).json({
        success: false,
        code: "DRIVER_UPI_NOT_AVAILABLE",
        message: "Driver ne abhi direct receiving UPI add nahi ki hai. Cash ya HimRideG online payment use karein."
      });
    }

    const amount = fareOf(booking);
    const payment = await DirectDriverPayment.findOneAndUpdate(
      { booking: booking._id },
      {
        $setOnInsert: {
          booking: booking._id,
          customer: booking.customer?._id || booking.customer,
          driver: booking.driver?._id || booking.driver,
          method: "upi"
        },
        $set: {
          amount,
          destinationMasked: maskUpi(found.upiId)
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        bookingId: String(booking._id),
        amount,
        driverName: booking.driver?.name || "HimRideG Driver",
        method: "upi",
        upiId: found.upiId,
        maskedUpi: maskUpi(found.upiId),
        upiUrl: upiUrl({
          upiId: found.upiId,
          payeeName: booking.driver?.name,
          amount,
          booking
        }),
        status: payment.status
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Driver UPI payment details load nahi hui"
    });
  }
};

exports.claimDirectDriverPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body?.bookingId || req.params.bookingId);
    ensureCustomerOwner(req, booking);
    ensureCompletedUnpaid(booking);

    const payment = await DirectDriverPayment.findOne({ booking: booking._id });
    if (!payment) {
      return res.status(409).json({
        success: false,
        message: "Pehle driver UPI payment details open karein"
      });
    }

    payment.status = "claimed";
    payment.claimedAt = new Date();
    await payment.save();

    /*
    | Compatibility: existing payment-pending/cash-confirm UI already knows how
    | to wait for driver acknowledgement. Financial settlement remains cash-like
    | because money went directly to driver; HimRideG only records 10% fee due.
    */
    booking.paymentMethod = "cash";
    booking.paymentStatus = "pending";
    booking.paymentChoiceAfterRide = "cash";
    booking.cashSelectedAt = payment.claimedAt;
    if (!booking.payment) booking.payment = {};
    booking.payment.method = "cash";
    booking.payment.status = "pending";
    booking.payment.gateway = "driver_upi";
    booking.payment.transactionId = `DIRECT_UPI_PENDING:${payment._id}`;
    await booking.save();

    const amount = fareOf(booking);
    const driverId = idOf(booking.driver);

    if (driverId) {
      sendPushToUser(driverId, {
        title: "UPI Payment Confirmation Required 💳",
        body: `Customer ne ₹${amount.toFixed(0)} aapke UPI par pay karne ka confirmation diya hai. Account me amount check karke Payment Received confirm karein.`,
        data: {
          type: "direct_driver_payment_claimed",
          soundEvent: "payment_required",
          bookingId: String(booking._id),
          amount: String(amount)
        }
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Driver ko payment confirmation bhej di gayi. Driver amount receive check karke confirm karega.",
      data: {
        bookingId: String(booking._id),
        amount,
        method: "upi",
        status: payment.status,
        claimedAt: payment.claimedAt
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Direct driver payment confirmation nahi bheji ja saki"
    });
  }
};

exports.confirmDirectDriverPayment = async (req, res) => {
  try {
    const bookingId = req.body?.bookingId || req.params.bookingId;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking nahi mili" });
    }

    ensureAssignedDriver(req, booking);

    const direct = await DirectDriverPayment.findOne({ booking: booking._id });
    if (!direct || !["claimed", "confirmed"].includes(direct.status)) {
      return res.status(409).json({
        success: false,
        message: "Customer ka direct UPI payment confirmation abhi pending hai"
      });
    }

    if (String(booking.status || "").toLowerCase() !== "completed") {
      return res.status(409).json({
        success: false,
        message: "Ride complete hone ke baad hi payment receive confirm karein"
      });
    }

    if (String(booking.paymentStatus || "").toLowerCase() !== "paid") {
      booking.paymentMethod = "cash";
      booking.paymentStatus = "paid";
      booking.paymentChoiceAfterRide = "cash";
      booking.paidAt = new Date();
      if (!booking.payment) booking.payment = {};
      booking.payment.method = "cash";
      booking.payment.status = "paid";
      booking.payment.gateway = "driver_upi";
      booking.payment.transactionId = `DIRECT_UPI:${direct._id}`;
      booking.payment.paidAt = booking.paidAt;
      await booking.save();
    }

    await walletService.settleRidePayment(booking._id);

    direct.status = "confirmed";
    direct.confirmedAt = direct.confirmedAt || new Date();
    await direct.save();

    const amount = fareOf(booking);
    const customerId = idOf(booking.customer);
    const driverId = idOf(booking.driver);

    if (customerId) {
      sendPushToUser(customerId, {
        title: "Payment Successful ✅",
        body: `Driver ne ₹${amount.toFixed(0)} UPI payment receive confirm kar di. Ride payment complete hai.`,
        data: {
          type: "payment_success",
          soundEvent: "payment_success",
          bookingId: String(booking._id),
          paymentMethod: "driver_upi"
        }
      }).catch(() => {});
    }

    if (driverId) {
      sendPushToUser(driverId, {
        title: `Payment Received ₹${amount.toFixed(0)} ✅`,
        body: "UPI payment received confirm ho gayi. HimRideG platform fee earning history me record ho gayi hai.",
        data: {
          type: "payment_success",
          soundEvent: "payment_success",
          bookingId: String(booking._id),
          paymentMethod: "driver_upi"
        }
      }).catch(() => {});
    }

    const freshBooking = await Booking.findById(booking._id)
      .populate("customer", "name profileImage")
      .populate("driver", "name profileImage driverProfile currentLocation");

    return res.status(200).json({
      success: true,
      message: "UPI Payment Received ✅",
      data: {
        booking: freshBooking,
        amount,
        paymentMethod: "driver_upi",
        paidAt: freshBooking?.paidAt,
        platformCommissionAmount: freshBooking?.platformCommissionAmount,
        driverPayableAmount: freshBooking?.driverPayableAmount
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Driver payment confirmation complete nahi hui"
    });
  }
};

exports.getDirectPaymentHistory = async (req, res) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();
    const userId = req.user?._id || req.user?.id;
    const filter = {};

    if (role === "driver") filter.driver = userId;
    else if (role === "customer") filter.customer = userId;
    else if (role !== "admin") {
      return res.status(403).json({ success: false, message: "Payment history access denied" });
    }

    const rows = await DirectDriverPayment.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        directPayments: rows.map((item) => ({
          bookingId: String(item.booking),
          method: item.method,
          amount: item.amount,
          destinationMasked: item.destinationMasked,
          status: item.status,
          claimedAt: item.claimedAt,
          confirmedAt: item.confirmedAt,
          createdAt: item.createdAt
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Direct payment history load nahi hui"
    });
  }
};
