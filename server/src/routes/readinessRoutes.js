const express = require("express");
const mongoose = require("mongoose");

const {
  mongo: mongoScalability,
  observability,
  webhooks: webhookScalability
} = require(
  "../config/scalability"
);
const router = express.Router();

const {
  getRedisStatus
} = require(
  "../services/redisRuntime"
);

const {
  getBackgroundJobStatus
} = require(
  "../services/backgroundJobService"
);

const {
  getLiveLocationCacheStatus
} = require(
  "../services/liveLocationCacheService"
);

const {
  getDistributedAvailabilityStatus
} = require(
  "../services/distributedDriverAvailabilityService"
);

const {
  getDistributedLockStatus
} = require(
  "../services/distributedLockService"
);

const {
  getMapCacheStatus
} = require(
  "../services/mapCacheService"
);

const {
  getSharedUploadStorageStatus
} = require(
  "../services/sharedUploadStorageService"
);

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

  // Phase 2 runtime status — no secrets/Redis URL exposed.
  const redisStatus =
    getRedisStatus();

  const backgroundJobStatus =
    getBackgroundJobStatus();

  const liveLocationStatus =
    getLiveLocationCacheStatus();

  // Phase 3 status — no driver IDs, locations, Redis keys or secrets exposed.
  const distributedAvailabilityStatus =
    getDistributedAvailabilityStatus();

  const distributedLockStatus =
    getDistributedLockStatus();

  const mapCacheStatus =
    getMapCacheStatus();

  const sharedUploadStatus =
    getSharedUploadStorageStatus();

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

      redis: {
        enabled:
          redisStatus.enabled,
        ready:
          redisStatus.ready,
        mode:
          redisStatus.mode,
        socketAdapterReady:
          redisStatus.socketAdapterReady
      },

      liveLocationCache:
        liveLocationStatus,

      distributedDriverAvailability:
        distributedAvailabilityStatus,

      distributedRideAcceptLock:
        distributedLockStatus,

      mapCache:
        mapCacheStatus,

      durableWebhooks: {
        enabled:
          webhookScalability
            .durableAckEnabled,
        backgroundQueueEnabled:
          webhookScalability
            .backgroundQueueEnabled,
        retryMaxAttempts:
          webhookScalability
            .retryMaxAttempts
      },

      uploadStorage: {
        ...sharedUploadStatus,
        sharedAcrossInstances:
          sharedUploadStatus.sharedReady,
        note:
          sharedUploadStatus.sharedReady
            ? "Hybrid local-disk + GridFS mirror active for multi-instance file access."
            : "Persistent disk fallback active; enable UPLOAD_STORAGE_MODE=hybrid-gridfs before horizontal web-instance scaling."
      },

      backgroundJobs: {
        enabled:
          backgroundJobStatus.enabled,
        distributedQueueReady:
          backgroundJobStatus.distributedQueueReady,
        workerRunning:
          backgroundJobStatus.workerRunning,
        registeredHandlers:
          backgroundJobStatus.registeredHandlers
      },

      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
