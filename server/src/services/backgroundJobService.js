/*
|--------------------------------------------------------------------------
| HimRideG Background Job Queue — Phase 2
|--------------------------------------------------------------------------
|
| Redis ready ho to queue distributed hoti hai. Redis unavailable ho to
| important work loss na ho isliye caller direct/local fallback use kar sakta
| hai. Existing request logic ko mandatory Redis dependency nahi banaya gaya.
|
*/

const crypto = require("node:crypto");

const scalability = require(
  "../config/scalability"
);

const {
  isRedisReady,
  getRedisCommandClient,
  getRedisQueueClient
} = require("./redisRuntime");

const handlers = new Map();

let workerRunning = false;
let workerPromise = null;
let processedCount = 0;
let failedCount = 0;
let enqueuedCount = 0;
let lastWorkerError = "";

function queueKey() {
  return `${scalability.redis.keyPrefix}:${scalability.backgroundJobs.queueName}`;
}

function deadLetterKey() {
  return `${queueKey()}:dead-letter`;
}

function canUseDistributedQueue() {
  return Boolean(
    scalability.backgroundJobs
      .enabled &&
      isRedisReady()
  );
}

function createJob(
  type,
  payload,
  options = {}
) {
  return {
    id:
      options.id ||
      crypto.randomUUID(),

    type:
      String(type || "").trim(),

    payload:
      payload ?? null,

    attempts:
      Number(options.attempts) || 0,

    maxAttempts:
      Number(options.maxAttempts) ||
      scalability.backgroundJobs
        .maxAttempts,

    createdAt:
      options.createdAt ||
      new Date().toISOString(),

    lastError:
      options.lastError ||
      null
  };
}

function registerBackgroundJobHandler(
  type,
  handler
) {
  const normalizedType =
    String(type || "").trim();

  if (
    !normalizedType ||
    typeof handler !== "function"
  ) {
    throw new Error(
      "Valid background job type and handler are required"
    );
  }

  handlers.set(
    normalizedType,
    handler
  );
}

async function enqueueBackgroundJob(
  type,
  payload,
  options = {}
) {
  if (!canUseDistributedQueue()) {
    return {
      queued: false,
      mode: "direct-fallback"
    };
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return {
      queued: false,
      mode: "direct-fallback"
    };
  }

  const job =
    createJob(
      type,
      payload,
      options
    );

  await redis.lPush(
    queueKey(),
    JSON.stringify(job)
  );

  enqueuedCount += 1;

  return {
    queued: true,
    mode: "redis",
    jobId: job.id,
    type: job.type
  };
}

async function pushRetryJob(
  job,
  error
) {
  const redis =
    getRedisCommandClient();

  if (!redis) {
    return false;
  }

  const nextJob = {
    ...job,
    attempts:
      Number(job.attempts || 0) + 1,
    lastError:
      String(
        error?.message ||
          error ||
          "Unknown job error"
      )
  };

  if (
    nextJob.attempts >=
    nextJob.maxAttempts
  ) {
    await redis.lPush(
      deadLetterKey(),
      JSON.stringify(nextJob)
    );

    failedCount += 1;

    return false;
  }

  const delayMs =
    Math.min(
      scalability.backgroundJobs
        .retryBaseDelayMs *
        Math.max(
          1,
          nextJob.attempts
        ),
      15000
    );

  setTimeout(() => {
    if (!isRedisReady()) {
      return;
    }

    const command =
      getRedisCommandClient();

    command
      ?.rPush(
        queueKey(),
        JSON.stringify(nextJob)
      )
      .catch((retryError) => {
        console.error(
          "[BackgroundJobs] retry enqueue error:",
          retryError?.message || retryError
        );
      });
  }, delayMs).unref?.();

  return true;
}

async function processJob(job) {
  const handler =
    handlers.get(
      String(job?.type || "")
    );

  if (!handler) {
    throw new Error(
      `No background job handler registered for ${job?.type || "unknown"}`
    );
  }

  await handler(
    job.payload,
    job
  );

  processedCount += 1;
}

async function workerLoop() {
  while (
    workerRunning &&
    canUseDistributedQueue()
  ) {
    const queueRedis =
      getRedisQueueClient();

    if (!queueRedis) {
      break;
    }

    try {
      const result =
        await queueRedis.brPop(
          queueKey(),
          scalability.backgroundJobs
            .blockingPopSeconds
        );

      if (!result) {
        continue;
      }

      const raw =
        typeof result === "string"
          ? result
          : result.element;

      if (!raw) {
        continue;
      }

      let job;

      try {
        job = JSON.parse(raw);
      } catch (parseError) {
        failedCount += 1;
        lastWorkerError =
          parseError.message;
        continue;
      }

      try {
        await processJob(job);
      } catch (jobError) {
        lastWorkerError =
          String(
            jobError?.message ||
              jobError
          );

        console.error(
          `[BackgroundJobs] ${job?.type || "unknown"} failed:`,
          lastWorkerError
        );

        await pushRetryJob(
          job,
          jobError
        );
      }
    } catch (error) {
      lastWorkerError =
        String(
          error?.message ||
            error
        );

      if (workerRunning) {
        console.error(
          "[BackgroundJobs] worker loop error:",
          lastWorkerError
        );
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            750
          )
      );
    }
  }
}

async function startBackgroundJobWorker() {
  if (!canUseDistributedQueue()) {
    console.log(
      "ℹ️ Distributed background jobs disabled — direct fallback active"
    );

    return getBackgroundJobStatus();
  }

  if (workerRunning) {
    return getBackgroundJobStatus();
  }

  workerRunning = true;

  workerPromise =
    workerLoop().catch((error) => {
      lastWorkerError =
        String(
          error?.message ||
            error
        );

      console.error(
        "[BackgroundJobs] worker stopped unexpectedly:",
        lastWorkerError
      );
    });

  console.log(
    "✅ Redis background job worker started"
  );

  return getBackgroundJobStatus();
}

async function stopBackgroundJobWorker() {
  workerRunning = false;

  if (workerPromise) {
    await Promise.race([
      workerPromise,
      new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1500
          )
      )
    ]);
  }

  workerPromise = null;

  if (
    scalability.backgroundJobs
      .enabled
  ) {
    console.log(
      "✅ Background job worker stopped"
    );
  }
}

function getBackgroundJobStatus() {
  return {
    enabled:
      scalability.backgroundJobs
        .enabled,

    distributedQueueReady:
      canUseDistributedQueue(),

    workerRunning,

    queueName:
      scalability.backgroundJobs
        .queueName,

    registeredHandlers:
      handlers.size,

    enqueuedCount,
    processedCount,
    failedCount,

    lastWorkerError:
      lastWorkerError || null
  };
}

module.exports = {
  registerBackgroundJobHandler,
  enqueueBackgroundJob,
  startBackgroundJobWorker,
  stopBackgroundJobWorker,
  getBackgroundJobStatus,
  canUseDistributedQueue
};
