const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 100
    },

    method: {
      type: String,
      enum: ["upi", "bank"],
      required: true
    },

    source: {
      type: String,
      enum: ["instant", "scheduled", "admin"],
      default: "instant"
    },

    status: {
      type: String,
      enum: [
        "requested",
        "processing",
        "uncertain",
        "queued",
        "pending_approval",
        "processed",
        "failed",
        "reversed",
        "cancelled"
      ],
      default: "requested",
      index: true
    },

    destination: {
      upiId: { type: String, trim: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      accountHolderName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifsc: { type: String, trim: true, uppercase: true, default: "" },
      maskedAccount: { type: String, trim: true, default: "" }
    },

    razorpayContactId: {
      type: String,
      trim: true,
      default: ""
    },

    razorpayFundAccountId: {
      type: String,
      trim: true,
      default: ""
    },

    razorpayPayoutId: {
      type: String,
      trim: true,
      default: "",
      index: true
    },

    razorpayStatus: {
      type: String,
      trim: true,
      default: ""
    },

    utr: {
      type: String,
      trim: true,
      default: ""
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    scheduledFor: {
      type: Date,
      default: null,
      index: true
    },

    processedAt: {
      type: Date,
      default: null
    },

    failedAt: {
      type: Date,
      default: null
    },

    failureReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    rawStatusDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ driver: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, updatedAt: 1 });

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
