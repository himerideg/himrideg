const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Customer Complaint (ADD-ONLY NEW MODEL)
|--------------------------------------------------------------------------
| Customer kisi ride ke driver ki complaint karta hai. Complaint seedha
| admin panel me us driver ki profile ke saath dikhti hai, jahan se admin
| warning bhej sakta hai / resolve / dismiss kar sakta hai.
|--------------------------------------------------------------------------
*/

const COMPLAINT_CATEGORIES = [
  "rude_behaviour",
  "rash_driving",
  "overcharging",
  "vehicle_condition",
  "route_issue",
  "late_or_no_show",
  "safety",
  "payment_issue",
  "other"
];

const COMPLAINT_STATUSES = [
  "open",
  "reviewing",
  "warned",
  "resolved",
  "dismissed"
];

const complaintSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true
    },

    bookingNumber: {
      type: String,
      trim: true,
      default: ""
    },

    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      default: "other",
      index: true
    },

    message: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      maxlength: 2000
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: "open",
      index: true
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },

    warningId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    handledAt: {
      type: Date,
      default: null
    },

    source: {
      type: String,
      enum: ["website", "customer_app", "admin"],
      default: "website"
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.index({ driver: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
// Ek customer ek ride ki ek hi complaint (spam se bachao).
complaintSchema.index({ customer: 1, booking: 1 }, { unique: true });

const Complaint = mongoose.model("Complaint", complaintSchema);

Complaint.COMPLAINT_CATEGORIES = COMPLAINT_CATEGORIES;
Complaint.COMPLAINT_STATUSES = COMPLAINT_STATUSES;

module.exports = Complaint;
