const mongoose = require("mongoose");

const rideAutoPayoutSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    payoutMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverPayoutMethod",
      default: null
    },
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: [
        "pending",
        "wallet_only",
        "processing",
        "submitted",
        "processed",
        "failed",
        "manual_override"
      ],
      default: "pending",
      index: true
    },
    withdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
      default: null
    },
    attempts: {
      type: Number,
      min: 0,
      default: 0
    },
    lastAttemptAt: {
      type: Date,
      default: null
    },
    nextRetryAt: {
      type: Date,
      default: null,
      index: true
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    }
  },
  { timestamps: true }
);

rideAutoPayoutSchema.index({ status: 1, nextRetryAt: 1 });
rideAutoPayoutSchema.index({ driver: 1, createdAt: -1 });

module.exports =
  mongoose.models.RideAutoPayout ||
  mongoose.model("RideAutoPayout", rideAutoPayoutSchema);
