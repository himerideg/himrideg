const express = require("express");
const mongoose = require("mongoose");

const {
  mongo: mongoScalability,
  observability
} = require(
  "../config/scalability"
);
const router = express.Router();

router.get("/", (req, res) => {
  const livePaymentKey = String(process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_live_");

  // ADD-ONLY runtime visibility for scaling/production diagnostics.
  const databaseReadyState =
    mongoose.connection.readyState;

  const databaseConnected =
    databaseReadyState === 1;

  const memoryUsage =
    process.memoryUsage();

  const toMb = (bytes) =>
    Number((bytes / 1024 / 1024).toFixed(1));
  res.status(200).json({
    success: true,
    data: {
      api: true,
      googleClientConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
      razorpayPaymentConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      realMoneyMode: String(process.env.REAL_MONEY_MODE || "false").toLowerCase() === "true",
      livePaymentKey,
      razorpayXPayoutEnabled: String(process.env.RAZORPAYX_PAYOUTS_ENABLED || "false").toLowerCase() === "true",
      razorpayXAccountConfigured: Boolean(process.env.RAZORPAYX_ACCOUNT_NUMBER),
      paymentWebhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      payoutWebhookConfigured: Boolean(process.env.RAZORPAYX_WEBHOOK_SECRET),

      databaseConnected,
      databaseReadyState,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRssMb: toMb(memoryUsage.rss),
      heapUsedMb: toMb(memoryUsage.heapUsed),
      mongoMaxPoolSize:
        mongoScalability.maxPoolSize,
      mongoMinPoolSize:
        mongoScalability.minPoolSize,
      slowRequestThresholdMs:
        observability.slowRequestMs,

      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
