const mongoose = require("mongoose");

const directDriverPaymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true
    },
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
    method: {
      type: String,
      enum: ["upi"],
      default: "upi"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    destinationMasked: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["ready", "claimed", "confirmed", "cancelled"],
      default: "ready",
      index: true
    },
    claimedAt: {
      type: Date,
      default: null
    },
    confirmedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

directDriverPaymentSchema.index({ driver: 1, createdAt: -1 });
directDriverPaymentSchema.index({ customer: 1, createdAt: -1 });

module.exports =
  mongoose.models.DirectDriverPayment ||
  mongoose.model("DirectDriverPayment", directDriverPaymentSchema);
