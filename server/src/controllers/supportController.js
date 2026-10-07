const Booking = require("../models/Booking");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const AccountDeletionRequest = require("../models/AccountDeletionRequest");

let sendPushToUser = null;
try {
  ({ sendPushToUser } = require("../services/pushNotificationService"));
} catch (error) {
  sendPushToUser = null;
}

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Support (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| 1) Customer complaint against driver (ride-linked)
| 2) Account deletion request — in-app (logged in) + public (login/email bhool
|    gaye). Admin approve karta hai; yahan sirf request banti hai.
|--------------------------------------------------------------------------
*/

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

function cleanText(value, max = 2000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function fail(res, status, message, code) {
  return res.status(status).json({ success: false, code, message });
}

const COMPLAINT_ALLOWED_STATUSES = [
  "driver_arrived",
  "started",
  "completed",
  "cancelled"
];

/*
| POST /api/v2/support/complaints
| body: { bookingId, category, message }
*/
async function createComplaint(req, res, next) {
  try {
    if (String(req.user?.role || "") !== "customer") {
      return fail(res, 403, "Sirf customer complaint kar sakta hai", "CUSTOMER_ONLY");
    }

    const bookingId = String(req.body?.bookingId || "").trim();
    const message = cleanText(req.body?.message, 2000);
    const category = Complaint.COMPLAINT_CATEGORIES.includes(req.body?.category)
      ? req.body.category
      : "other";

    if (!bookingId) return fail(res, 400, "Ride select karein", "BOOKING_REQUIRED");
    if (message.length < 5) {
      return fail(res, 400, "Complaint thoda detail me likhein (kam se kam 5 akshar)", "MESSAGE_TOO_SHORT");
    }

    const booking = await Booking.findById(bookingId).select("customer driver bookingNumber status");
    if (!booking) return fail(res, 404, "Ride nahi mili", "BOOKING_NOT_FOUND");

    if (idOf(booking.customer) !== idOf(req.user._id)) {
      return fail(res, 403, "Ye aapki ride nahi hai", "NOT_YOUR_RIDE");
    }

    if (!booking.driver) {
      return fail(res, 409, "Is ride me koi driver assign nahi tha", "NO_DRIVER");
    }

    if (!COMPLAINT_ALLOWED_STATUSES.includes(String(booking.status || ""))) {
      return fail(res, 409, "Driver ke pickup par pahunchne ke baad hi complaint kar sakte hain", "TOO_EARLY");
    }

    const highCategories = ["safety", "rash_driving"];
    const severity = highCategories.includes(category) ? "high" : category === "other" ? "low" : "medium";

    let complaint;
    try {
      complaint = await Complaint.create({
        customer: req.user._id,
        driver: booking.driver,
        booking: booking._id,
        bookingNumber: booking.bookingNumber || "",
        category,
        message,
        severity,
        source: req.body?.source === "customer_app" ? "customer_app" : "website"
      });
    } catch (error) {
      if (error?.code === 11000) {
        return fail(res, 409, "Is ride ki complaint pehle hi ho chuki hai. Admin team dekh rahi hai.", "ALREADY_REPORTED");
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Complaint admin team ko bhej di gayi. Aapki details driver ko nahi dikhayi jaayengi.",
      data: { complaint }
    });
  } catch (error) {
    return next(error);
  }
}

/*
| GET /api/v2/support/complaints/mine
*/
async function getMyComplaints(req, res, next) {
  try {
    const complaints = await Complaint.find({ customer: req.user._id })
      .select("booking bookingNumber category message status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, data: { complaints } });
  } catch (error) {
    return next(error);
  }
}

/*
| POST /api/v2/support/account-deletion   (logged in)
| body: { reason }
*/
async function requestAccountDeletion(req, res, next) {
  try {
    const user = req.user;
    const role = ["customer", "driver"].includes(user?.role) ? user.role : "unknown";

    const existing = await AccountDeletionRequest.findOne({
      user: user._id,
      status: "pending"
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Aapki account delete request pehle se admin ke paas hai. 7 din ke andar process hogi.",
        data: { request: existing }
      });
    }

    const request = await AccountDeletionRequest.create({
      user: user._id,
      role,
      source: "in_app",
      name: cleanText(user.name, 120),
      phone: normalizePhone(user.phone),
      email: String(user.email || ""),
      reason: cleanText(req.body?.reason, 1000),
      accountFound: true,
      requestIp: String(req.ip || "").slice(0, 64)
    });

    return res.status(201).json({
      success: true,
      message: "Account delete request admin ko bhej di gayi. 7 din ke andar process hogi aur aapko SMS/notification milega.",
      data: { request }
    });
  } catch (error) {
    return next(error);
  }
}

/*
| GET /api/v2/support/account-deletion   (logged in) — status
*/
async function getMyDeletionRequest(req, res, next) {
  try {
    const request = await AccountDeletionRequest.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: { request } });
  } catch (error) {
    return next(error);
  }
}

/*
| POST /api/v2/support/account-deletion/cancel   (logged in)
*/
async function cancelMyDeletionRequest(req, res, next) {
  try {
    const request = await AccountDeletionRequest.findOneAndUpdate(
      { user: req.user._id, status: "pending" },
      { $set: { status: "cancelled", processedAt: new Date() } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: request ? "Delete request cancel ho gayi." : "Koi pending request nahi hai.",
      data: { request }
    });
  } catch (error) {
    return next(error);
  }
}

/*
| POST /api/v2/support/account-deletion/public   (NO login)
| body: { phone, name?, email?, role?, reason? }
| Email/login bhool gaye users ke liye. Response kabhi nahi batata ki account
| exist karta hai ya nahi (privacy). Admin call karke verify karta hai.
*/
async function requestPublicAccountDeletion(req, res, next) {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return fail(res, 400, "Sahi 10 digit mobile number likhein", "INVALID_PHONE");
    }

    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 150);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, 400, "Email sahi nahi hai (khali chhod sakte hain)", "INVALID_EMAIL");
    }

    const requestedRole = ["customer", "driver"].includes(req.body?.role) ? req.body.role : "unknown";

    const user = await User.findOne({ phone }).select("_id role name email accountStatus");
    const genericMessage =
      "Request mil gayi. HimRideG team 7 din ke andar is number par call/SMS karke verify karegi, phir account delete hoga.";

    if (user && user.accountStatus === "deleted") {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const existing = await AccountDeletionRequest.findOne({ phone, status: "pending" });
    if (existing) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    await AccountDeletionRequest.create({
      user: user?._id || null,
      role: user?.role === "customer" || user?.role === "driver" ? user.role : requestedRole,
      source: "public",
      name: cleanText(req.body?.name, 120),
      phone,
      email,
      reason: cleanText(req.body?.reason, 1000),
      accountFound: Boolean(user),
      requestIp: String(req.ip || "").slice(0, 64)
    });

    return res.status(201).json({ success: true, message: genericMessage });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  requestAccountDeletion,
  getMyDeletionRequest,
  cancelMyDeletionRequest,
  requestPublicAccountDeletion,
  // shared helpers for admin controller
  _helpers: { normalizePhone, cleanText, idOf, sendPushToUser: () => sendPushToUser }
};
