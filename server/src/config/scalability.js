/*
|--------------------------------------------------------------------------
| HimRideG Scalability Foundation Configuration
|--------------------------------------------------------------------------
|
| ADD-ONLY file.
| Existing ride, payment, login, wallet, map and notification logic ko
| change kiye bina backend ke safe capacity controls centralize karta hai.
|
| Values environment variables se override ki ja sakti hain. Defaults
| current single-node deployment ke liye conservative rakhe gaye hain.
|
*/

function positiveInteger(
  value,
  fallback,
  {
    minimum = 1,
    maximum = Number.MAX_SAFE_INTEGER
  } = {}
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const integer = Math.floor(parsed);

  if (integer < minimum) {
    return minimum;
  }

  if (integer > maximum) {
    return maximum;
  }

  return integer;
}

function booleanValue(
  value,
  fallback = false
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(
    String(value)
      .trim()
      .toLowerCase()
  );
}

const scalabilityConfig = Object.freeze({
  mongo: Object.freeze({
    maxPoolSize: positiveInteger(
      process.env.MONGODB_MAX_POOL_SIZE,
      50,
      {
        minimum: 10,
        maximum: 200
      }
    ),

    minPoolSize: positiveInteger(
      process.env.MONGODB_MIN_POOL_SIZE,
      2,
      {
        minimum: 0,
        maximum: 20
      }
    ),

    maxIdleTimeMS: positiveInteger(
      process.env.MONGODB_MAX_IDLE_TIME_MS,
      30000,
      {
        minimum: 5000,
        maximum: 300000
      }
    ),

    socketTimeoutMS: positiveInteger(
      process.env.MONGODB_SOCKET_TIMEOUT_MS,
      45000,
      {
        minimum: 10000,
        maximum: 180000
      }
    ),

    connectTimeoutMS: positiveInteger(
      process.env.MONGODB_CONNECT_TIMEOUT_MS,
      10000,
      {
        minimum: 5000,
        maximum: 60000
      }
    ),

    heartbeatFrequencyMS: positiveInteger(
      process.env.MONGODB_HEARTBEAT_FREQUENCY_MS,
      10000,
      {
        minimum: 5000,
        maximum: 60000
      }
    )
  }),

  observability: Object.freeze({
    slowRequestMs: positiveInteger(
      process.env.SLOW_REQUEST_MS,
      1200,
      {
        minimum: 250,
        maximum: 30000
      }
    ),

    requestIdHeader:
      "X-HimRideG-Request-Id"
  }),


  redis: Object.freeze({
    enabled: booleanValue(
      process.env.REDIS_ENABLED,
      Boolean(
        String(
          process.env.REDIS_URL || ""
        ).trim()
      )
    ),

    required: booleanValue(
      process.env.REDIS_REQUIRED,
      false
    ),

    socketAdapterEnabled: booleanValue(
      process.env.SOCKET_REDIS_ADAPTER_ENABLED,
      true
    ),

    url:
      String(
        process.env.REDIS_URL || ""
      ).trim(),

    keyPrefix:
      String(
        process.env.REDIS_KEY_PREFIX ||
          "himrideg:v2"
      )
        .trim() ||
      "himrideg:v2",

    connectTimeoutMs: positiveInteger(
      process.env.REDIS_CONNECT_TIMEOUT_MS,
      10000,
      {
        minimum: 1000,
        maximum: 60000
      }
    )
  }),

  liveLocation: Object.freeze({
    cacheEnabled: booleanValue(
      process.env.LIVE_LOCATION_CACHE_ENABLED,
      true
    ),

    cacheTtlSeconds: positiveInteger(
      process.env.LIVE_LOCATION_CACHE_TTL_SECONDS,
      90,
      {
        minimum: 15,
        maximum: 600
      }
    ),

    rideAccessTtlSeconds: positiveInteger(
      process.env.LIVE_LOCATION_ACCESS_TTL_SECONDS,
      8,
      {
        minimum: 2,
        maximum: 30
      }
    ),

    mongoPersistIntervalMs: positiveInteger(
      process.env.LIVE_LOCATION_MONGO_PERSIST_MS,
      15000,
      {
        minimum: 5000,
        maximum: 60000
      }
    )
  }),

  backgroundJobs: Object.freeze({
    enabled: booleanValue(
      process.env.BACKGROUND_JOBS_ENABLED,
      true
    ),

    queueName:
      String(
        process.env.BACKGROUND_JOB_QUEUE ||
          "jobs:default"
      )
        .trim() ||
      "jobs:default",

    maxAttempts: positiveInteger(
      process.env.BACKGROUND_JOB_MAX_ATTEMPTS,
      3,
      {
        minimum: 1,
        maximum: 10
      }
    ),

    retryBaseDelayMs: positiveInteger(
      process.env.BACKGROUND_JOB_RETRY_DELAY_MS,
      1500,
      {
        minimum: 250,
        maximum: 30000
      }
    ),

    blockingPopSeconds: positiveInteger(
      process.env.BACKGROUND_JOB_BLOCKING_POP_SECONDS,
      1,
      {
        minimum: 1,
        maximum: 5
      }
    )
  }),

  distributedAvailability: Object.freeze({
    enabled: booleanValue(
      process.env.DISTRIBUTED_DRIVER_AVAILABILITY_ENABLED,
      true
    ),

    redisPrefilterEnabled: booleanValue(
      process.env.DRIVER_MATCH_REDIS_PREFILTER_ENABLED,
      true
    ),

    ttlSeconds: positiveInteger(
      process.env.DRIVER_AVAILABILITY_TTL_SECONDS,
      120,
      {
        minimum: 30,
        maximum: 600
      }
    ),

    locationStaleSeconds: positiveInteger(
      process.env.DRIVER_LOCATION_STALE_SECONDS,
      180,
      {
        minimum: 30,
        maximum: 1800
      }
    ),

    warmupLimit: positiveInteger(
      process.env.DRIVER_AVAILABILITY_WARMUP_LIMIT,
      5000,
      {
        minimum: 100,
        maximum: 50000
      }
    )
  }),

  rideAcceptLock: Object.freeze({
    enabled: booleanValue(
      process.env.RIDE_ACCEPT_DISTRIBUTED_LOCK_ENABLED,
      true
    ),

    ttlMs: positiveInteger(
      process.env.RIDE_ACCEPT_LOCK_TTL_MS,
      8000,
      {
        minimum: 2000,
        maximum: 30000
      }
    )
  }),

  /*
  |------------------------------------------------------------------------
  | Phase 4 — Shared Map Cache
  |------------------------------------------------------------------------
  | Existing in-process map cache remains L1 fallback. Redis becomes L2 so
  | Geoapify responses can be reused across multiple backend instances.
  */
  mapCache: Object.freeze({
    redisEnabled: booleanValue(
      process.env.MAP_CACHE_REDIS_ENABLED,
      true
    ),

    namespace:
      String(
        process.env.MAP_CACHE_NAMESPACE ||
          "map"
      )
        .trim() ||
      "map"
  }),

  /*
  |------------------------------------------------------------------------
  | Phase 4 — Durable Webhook Processing
  |------------------------------------------------------------------------
  */
  webhooks: Object.freeze({
    durableAckEnabled: booleanValue(
      process.env.WEBHOOK_DURABLE_ACK_ENABLED,
      true
    ),

    backgroundQueueEnabled: booleanValue(
      process.env.WEBHOOK_BACKGROUND_QUEUE_ENABLED,
      true
    ),

    retryMaxAttempts: positiveInteger(
      process.env.WEBHOOK_RETRY_MAX_ATTEMPTS,
      5,
      {
        minimum: 1,
        maximum: 20
      }
    )
  }),

  rateLimits: Object.freeze({
    rideMutationPerMinute: positiveInteger(
      process.env.RIDE_MUTATION_LIMIT_PER_MINUTE,
      120,
      {
        minimum: 30,
        maximum: 600
      }
    ),

    liveLocationPerMinute: positiveInteger(
      process.env.LIVE_LOCATION_LIMIT_PER_MINUTE,
      240,
      {
        minimum: 60,
        maximum: 1200
      }
    )
  })
});

module.exports = scalabilityConfig;
