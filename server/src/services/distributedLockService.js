/*
|--------------------------------------------------------------------------
| HimRideG Distributed Ride Locks — Phase 3
|--------------------------------------------------------------------------
|
| Redis SET NX PX lock is an extra multi-instance guard around ride accept.
| MongoDB atomic findOneAndUpdate remains the final source-of-truth.
|
| Redis disabled/unavailable => lock helper returns fallback permission and
| existing MongoDB atomic behavior continues. This prevents Redis outage from
| breaking live rides.
|--------------------------------------------------------------------------
*/

const crypto = require("crypto");

const scalability = require(
  "../config/scalability"
);

const {
  isRedisReady,
  getRedisCommandClient
} = require("./redisRuntime");

function getId(value) {
  return String(
    value?._id ||
      value?.id ||
      value ||
      ""
  );
}

function lockEnabled() {
  return Boolean(
    scalability.rideAcceptLock
      ?.enabled &&
      isRedisReady()
  );
}

function rideAcceptLockKey(
  bookingId
) {
  return `${scalability.redis.keyPrefix}:lock:ride-accept:${getId(bookingId)}`;
}

async function acquireRideAcceptLock(
  bookingId
) {
  if (!lockEnabled()) {
    return {
      acquired: true,
      distributed: false,
      key: null,
      token: null
    };
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return {
      acquired: true,
      distributed: false,
      key: null,
      token: null
    };
  }

  const key =
    rideAcceptLockKey(
      bookingId
    );

  const token =
    crypto.randomUUID();

  try {
    const result =
      await redis.set(
        key,
        token,
        {
          NX: true,
          PX:
            Number(
              scalability
                .rideAcceptLock
                ?.ttlMs ||
                8000
            )
        }
      );

    return {
      acquired:
        result === "OK",
      distributed: true,
      key,
      token
    };
  } catch (error) {
    console.error(
      "[DistributedLock] Redis acquire failed; MongoDB atomic fallback active:",
      error?.message || error
    );

    return {
      acquired: true,
      distributed: false,
      key: null,
      token: null
    };
  }
}

async function releaseRideAcceptLock(
  lock
) {
  if (
    !lock?.distributed ||
    !lock?.key ||
    !lock?.token ||
    !isRedisReady()
  ) {
    return false;
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return false;
  }

  const releaseScript = [
    "if redis.call('get', KEYS[1]) == ARGV[1] then",
    "  return redis.call('del', KEYS[1])",
    "else",
    "  return 0",
    "end"
  ].join("\n");

  try {
    const result =
      await redis.eval(
        releaseScript,
        {
          keys: [lock.key],
          arguments: [
            lock.token
          ]
        }
      );

    return Number(result) === 1;
  } catch (error) {
    console.error(
      "[DistributedLock] release failed; TTL will self-expire the lock:",
      error?.message || error
    );

    return false;
  }
}

function getDistributedLockStatus() {
  return {
    enabled:
      Boolean(
        scalability.rideAcceptLock
          ?.enabled
      ),
    active:
      lockEnabled(),
    ttlMs:
      Number(
        scalability.rideAcceptLock
          ?.ttlMs ||
          8000
      ),
    mongoAtomicFallback:
      true
  };
}

module.exports = {
  lockEnabled,
  acquireRideAcceptLock,
  releaseRideAcceptLock,
  getDistributedLockStatus
};
