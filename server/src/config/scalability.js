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
