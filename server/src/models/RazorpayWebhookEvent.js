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

    /*
    |----------------------------------------------------------------------
    | Phase 4 durable webhook fields
    |----------------------------------------------------------------------
    | Signature verify hone ke baad event ko ACK se pehle MongoDB me store
    | kiya jata hai. Payload private backend audit/retry ke liye hai.
    */
    payload: { type: mongoose.Schema.Types.Mixed, default: null, select: false },
    attemptCount: { type: Number, default: 0, min: 0 },
    receivedAt: { type: Date, default: Date.now },
    queuedAt: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null },

    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

razorpayWebhookEventSchema.index({ kind: 1, eventId: 1 }, { unique: true });
razorpayWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model("RazorpayWebhookEvent", razorpayWebhookEventSchema);
