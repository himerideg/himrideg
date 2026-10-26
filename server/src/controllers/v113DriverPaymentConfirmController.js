/*
|--------------------------------------------------------------------------
| HimRideG V113 — Driver Confirm Payment + Customer "Payment nahi di"
| (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| POST /api/v2/payments/driver-confirm-payment   { bookingId, mode }
|   mode = "offline" (cash) | "online" (UPI / bank direct to driver)
|   - Ride ke dauran (fare locked se started tak): confirmation save hoti hai,
|     ride complete hote hi booking Paid + driver release ho jata hai.
|   - Ride completed: turant Paid + driver release (customer ka payment
|     confirm hona zaroori nahi).
|   Customer ko socket + push notification jaata hai.
|
| POST /api/v2/payments/customer-report-not-paid { bookingId, note }
|   Customer bolta hai "maine payment nahi di" -> admin panel complaint
|   (category payment_issue, severity high).
|--------------------------------------------------------------------------
*/

const Booking = require("../models/Booking");
const Complaint = require("../models/Complaint");
const paymentController = require("./paymentController");

let sendPushToUser = null;
try {
  ({ sendPushToUser } = require("../services/pushNotificationService"));
} catch (error) {
  sendPushToUser = null;
}

const PRE_CONFIRM_STATUSES = [
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "arrived",
  "started"
];

const MODE_TEXT = {
  offline: "Cash / Offline",
  online: "Online"
};

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

function cleanMode(value) {
  const text = String(value || "").trim().toLowerCase();
  if (["online", "upi", "bank", "card"].includes(text)) return "online";
  if (["offline", "cash"].includes(text)) return "offline";
  return "";
}

function fareOf(booking) {
  return Number(
    booking?.finalFare ||
      booking?.fare?.finalFare ||
      booking?.driverOfferedFare ||
      0
  );
}

function emitToUser(req, userId, event, payload) {
  try {
    const io = req?.app?.get?.("io");
    if (io && userId) io.to(`user:${userId}`).emit(event, payload);
  } catch (error) {
    /* socket failure never blocks payment */
  }
}

function pushTo(userId, message) {
  if (!sendPushToUser || !userId) return;
  sendPushToUser(userId, message).catch(() => {});
}

/*
| Existing cash-confirm controller ko hi chalate hain (commission, wallet
| settlement, driver release, customer socket — sab wahi purana logic).
*/
function runExistingCashConfirm(req, bookingId) {
  return new Promise((resolve) => {
    const fakeReq = {
      ...req,
      body: { bookingId },
      user: req.user,
      app: req.app
    };

    const fakeRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ statusCode: this.statusCode, body });
        return this;
      }
    };

    Promise.resolve(paymentController.confirmCashPayment(fakeReq, fakeRes)).catch(
      (error) => {
        resolve({
          statusCode: 500,
          body: { success: false, message: error?.message || "Payment confirm nahi hui" }
        });
      }
    );
  });
}

async function finalizeDriverConfirmation(req, booking, mode) {
  const result = await runExistingCashConfirm(req, String(booking._id));

  if (result.statusCode >= 400 || result.body?.success === false) {
    return result;
  }

  await Booking.updateOne(
    { _id: booking._id },
    {
      $set: {
        driverPaymentConfirmMode: mode,
        driverPaymentConfirmedAt: new Date()
      }
    }
  );

  const customerId = idOf(booking.customer);
  const payload = {
    bookingId: String(booking._id),
    paymentStatus: "paid",
    driverConfirmed: true,
    mode,
    modeText: MODE_TEXT[mode] || mode,
    fare: fareOf(booking),
    canReportNotPaid: true,
    message: `Driver ne ${MODE_TEXT[mode] || ""} payment milna confirm kiya. Agar aapne payment nahi di to "Payment nahi di" report karein.`
  };

  emitToUser(req, customerId, "payment:driver-confirmed", payload);

  pushTo(customerId, {
    title: "Payment confirmed by driver ✅",
    body: `₹${fareOf(booking).toFixed(0)} ${MODE_TEXT[mode] || ""} payment driver ne confirm ki. Galat hai to app me report karein.`,
    data: {
      type: "payment_driver_confirmed",
      soundEvent: "payment_done",
      role: "customer",
      bookingId: String(booking._id),
      mode
    }
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message:
        result.body?.message ||
        "Payment confirm ho gayi. Aap next ride ke liye free hain ✅",
      data: {
        ...(result.body?.data || {}),
        bookingId: String(booking._id),
        paymentStatus: "paid",
        driverPaymentConfirmMode: mode,
        driverReleased: true
      }
    }
  };
}

exports.driverConfirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body || {};
    const mode = cleanMode(req.body?.mode || req.body?.method);
    const actorRole = String(req.user?.role || "").toLowerCase();
    const actorId = String(req.user?._id || "");

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID required hai" });
    }

    if (!mode) {
      return res.status(400).json({
        success: false,
        code: "PAYMENT_MODE_REQUIRED",
        message: "Online ya Offline (cash) chuniye"
      });
    }

    if (actorRole !== "driver" && actorRole !== "admin") {
      return res.status(403).json({
        success: false,
        code: "DRIVER_ONLY",
        message: "Payment sirf assigned driver confirm kar sakta hai"
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking nahi mili" });
    }

    if (actorRole === "driver" && idOf(booking.driver) !== actorId) {
      return res.status(403).json({
        success: false,
        code: "NOT_ASSIGNED_DRIVER",
        message: "Sirf assigned driver is ride ki payment confirm kar sakta hai"
      });
    }

    const status = String(booking.status || "").toLowerCase();

    if (status === "completed") {
      const result = await finalizeDriverConfirmation(req, booking, mode);
      return res.status(result.statusCode).json(result.body);
    }

    if (PRE_CONFIRM_STATUSES.includes(status)) {
      booking.driverPaymentPreConfirmMode = mode;
      booking.driverPaymentPreConfirmedAt = new Date();
      await booking.save();

      const customerId = idOf(booking.customer);
      emitToUser(req, customerId, "payment:driver-preconfirmed", {
        bookingId: String(booking._id),
        mode,
        modeText: MODE_TEXT[mode] || mode,
        message: `Driver ne ${MODE_TEXT[mode] || ""} payment milna confirm kiya. Ride complete hote hi booking close ho jayegi.`
      });

      return res.status(200).json({
        success: true,
        message: "Payment confirm save ho gayi. Ride complete karte hi booking release ho jayegi ✅",
        data: {
          bookingId: String(booking._id),
          preConfirmed: true,
          driverPaymentPreConfirmMode: mode
        }
      });
    }

    return res.status(409).json({
      success: false,
      code: "PAYMENT_CONFIRM_NOT_ALLOWED",
      message: "Is ride status me payment confirm nahi ho sakti"
    });
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || "Payment confirm nahi ho saki"
    });
  }
};

/*
| Ride complete hone par: agar driver pehle hi payment confirm kar chuka hai
| to booking turant paid + release. Ride complete flow ko kabhi fail nahi
| karta.
*/
exports.applyPreConfirmAfterComplete = async (req, bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return null;
    if (String(booking.status || "").toLowerCase() !== "completed") return null;
    if (String(booking.paymentStatus || "").toLowerCase() === "paid") return null;
    const mode = cleanMode(booking.driverPaymentPreConfirmMode);
    if (!mode) return null;
    const result = await finalizeDriverConfirmation(req, booking, mode);
    return result?.body || null;
  } catch (error) {
    console.error("[V113 pre-confirm after complete]", error?.message || error);
    return null;
  }
};

exports.customerReportNotPaid = async (req, res) => {
  try {
    const { bookingId } = req.body || {};
    const note = String(req.body?.note || "").replace(/\s+/g, " ").trim().slice(0, 400);
    const actorRole = String(req.user?.role || "").toLowerCase();
    const actorId = String(req.user?._id || "");

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID required hai" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking nahi mili" });
    }

    if (actorRole !== "customer" || idOf(booking.customer) !== actorId) {
      return res.status(403).json({
        success: false,
        message: "Sirf is ride ka customer report kar sakta hai"
      });
    }

    if (!booking.driver) {
      return res.status(409).json({ success: false, message: "Is ride me driver assigned nahi hai" });
    }

    booking.customerPaymentDisputeAt = new Date();
    booking.customerPaymentDisputeNote = note;
    await booking.save();

    const message =
      `Customer report: maine payment nahi di, lekin driver ne ${MODE_TEXT[booking.driverPaymentConfirmMode] || ""} payment confirm kar di.` +
      (note ? ` Note: ${note}` : "");

    try {
      await Complaint.create({
        customer: booking.customer,
        driver: booking.driver,
        booking: booking._id,
        bookingNumber: String(booking.bookingNumber || booking.bookingId || ""),
        category: "payment_issue",
        severity: "high",
        message,
        source: String(req.headers?.["x-himrideg-client"] || "").includes("app")
          ? "customer_app"
          : "website"
      });
    } catch (error) {
      if (error?.code === 11000) {
        /* same ride ki complaint pehle se hai -> usi me jodo */
        const existing = await Complaint.findOne({ customer: booking.customer, booking: booking._id });
        if (existing) {
          existing.message = `${existing.message}\n\n${message}`.slice(0, 2000);
          existing.status = "open";
          existing.severity = "high";
          await existing.save().catch(() => {});
        }
      } else {
        throw error;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Report admin ko bhej di gayi. HimRideG team check karegi.",
      data: { bookingId: String(booking._id), disputed: true }
    });
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || "Report nahi bhej saki"
    });
  }
};
