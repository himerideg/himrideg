const mongoose = require("mongoose");

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["payment", "payout"], required: true },
    eventType: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["processing", "processed", "ignored", "error"],
      default: "processing",
      index: true
    },
    entityId: { type: String, trim: true, default: "" },
    errorMessage: { type: String, trim: true, maxlength: 1500, default: "" },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

razorpayWebhookEventSchema.index({ kind: 1, eventId: 1 }, { unique: true });
razorpayWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model("RazorpayWebhookEvent", razorpayWebhookEventSchema);
