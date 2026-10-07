const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Account Deletion Request (ADD-ONLY NEW MODEL)
|--------------------------------------------------------------------------
| Customer ya driver apna account delete karwane ki request bhejta hai:
|   - "in_app": login ke baad profile se
|   - "public": login ke bina (email/login bhool gaye) — mobile number se
| Admin panel me request aati hai. Admin verify karke Approve karta hai to
| account anonymize + deactivate hota hai (ride/payment records legal/tax
| ke liye rehte hain, personal details hat jaati hain).
|--------------------------------------------------------------------------
*/

const accountDeletionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    role: {
      type: String,
      enum: ["customer", "driver", "unknown"],
      default: "unknown",
      index: true
    },

    source: {
      type: String,
      enum: ["in_app", "public"],
      default: "in_app"
    },

    // Request ke time ki details (approve ke baad user record anonymize ho
    // jata hai, isliye audit ke liye yahan rehti hain).
    name: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, trim: true, maxlength: 15, default: "", index: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 150, default: "" },

    reason: { type: String, trim: true, maxlength: 1000, default: "" },

    accountFound: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true
    },

    adminNote: { type: String, trim: true, maxlength: 1000, default: "" },

    // Approve ke time check: active ride / wallet balance / due
    blockers: { type: [String], default: [] },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    processedAt: { type: Date, default: null },

    requestIp: { type: String, trim: true, maxlength: 64, default: "" }
  },
  {
    timestamps: true
  }
);

accountDeletionRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model(
  "AccountDeletionRequest",
  accountDeletionRequestSchema
);
