/*
|--------------------------------------------------------------------------
| HimRideG Live Location Cache — Phase 2
|--------------------------------------------------------------------------
|
| High-frequency driver GPS events ko Redis me fast cache karta hai aur
| MongoDB persistence ko configurable interval par throttle karta hai.
|
| IMPORTANT SAFETY:
| Redis/config unavailable ho to service null return karti hai. Caller phir
| existing MongoDB write path use karta hai. Isliye current ride flow ka
| fallback intact rahta hai.
|
*/

const Booking = require("../models/Booking");
const User = require("../models/User");

const scalability = require(
  "../config/scalability"
);

const {
  isRedisReady,
  getRedisCommandClient
} = require("./redisRuntime");

const localPersistMarkers =
  new Map();

function getId(value) {
  return String(
    value?._id ||
      value?.id ||
      value ||
      ""
  );
}

function liveLocationEnabled() {
  return Boolean(
    scalability.liveLocation
      .cacheEnabled &&
      isRedisReady()
  );
}

function key(suffix) {
  return `${scalability.redis.keyPrefix}:${suffix}`;
}

function rideLocationKey(
  bookingId
) {
  return key(
    `live:ride:${getId(bookingId)}:driver-location`
  );
}

function driverLocationKey(
  driverId
) {
  return key(
    `live:driver:${getId(driverId)}:location`
  );
}

function rideAccessKey(
  bookingId,
  driverId
) {
  return key(
    `live:ride-access:${getId(bookingId)}:${getId(driverId)}`
  );
}

function persistLockKey(
  bookingId,
  driverId
) {
  return key(
    `live:persist:${getId(bookingId)}:${getId(driverId)}`
  );
}

async function setJson(
  redis,
  redisKey,
  value,
  ttlSeconds
) {
  await redis.set(
    redisKey,
    JSON.stringify(value),
    {
      EX:
        Math.max(
          1,
          Number(ttlSeconds) || 1
        )
    }
  );
}

async function getJson(
  redis,
  redisKey
) {
  const raw =
    await redis.get(redisKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

async function cacheLocation({
  redis,
  bookingId,
  driverId,
  location
}) {
  const payload = {
    bookingId:
      getId(bookingId),

    driverId:
      getId(driverId),

    location,

    cachedAt:
      new Date().toISOString()
  };

  await Promise.all([
    setJson(
      redis,
      rideLocationKey(
        bookingId
      ),
      payload,
      scalability.liveLocation
        .cacheTtlSeconds
    ),

    setJson(
      redis,
      driverLocationKey(
        driverId
      ),
      payload,
      scalability.liveLocation
        .cacheTtlSeconds
    )
  ]);

  return payload;
}

async function getRideAccess({
  redis,
  bookingId,
  driverId,
  allowedStatuses
}) {
  const cacheKey =
    rideAccessKey(
      bookingId,
      driverId
    );

  const cached =
    await getJson(
      redis,
      cacheKey
    );

  if (
    cached &&
    allowedStatuses.includes(
      String(cached.status || "")
    )
  ) {
    return cached;
  }

  const booking =
    await Booking.findOne({
      _id:
        bookingId,

      driver:
        driverId,

      status: {
        $in:
          allowedStatuses
      }
    })
      .select(
        "_id customer driver status driverLocation"
      )
      .lean();

  if (!booking) {
    return null;
  }

  const access = {
    _id:
      getId(booking._id),

    customer:
      getId(booking.customer),

    driver:
      getId(booking.driver),

    status:
      String(booking.status || "")
  };

  await setJson(
    redis,
    cacheKey,
    access,
    scalability.liveLocation
      .rideAccessTtlSeconds
  );

  return access;
}

async function shouldPersist({
  redis,
  bookingId,
  driverId
}) {
  const lockKey =
    persistLockKey(
      bookingId,
      driverId
    );

  try {
    const result =
      await redis.set(
        lockKey,
        String(Date.now()),
        {
          NX: true,
          PX:
            scalability.liveLocation
              .mongoPersistIntervalMs
        }
      );

    return result === "OK";
  } catch (error) {
    const localKey =
      `${getId(bookingId)}:${getId(driverId)}`;

    const now = Date.now();
    const previous =
      localPersistMarkers.get(
        localKey
      ) || 0;

    if (
      now - previous >=
      scalability.liveLocation
        .mongoPersistIntervalMs
    ) {
      localPersistMarkers.set(
        localKey,
        now
      );

      return true;
    }

    return false;
  }
}

async function persistLocation({
  bookingId,
  driverId,
  location,
  allowedStatuses
}) {
  const bookingResult =
    await Booking.updateOne(
      {
        _id:
          bookingId,

        driver:
          driverId,

        status: {
          $in:
            allowedStatuses
        }
      },

      {
        $set: {
          driverLocation:
            location
        }
      },

      {
        runValidators: true
      }
    );

  if (
    !bookingResult.matchedCount
  ) {
    return false;
  }

  await User.updateOne(
    {
      _id:
        driverId,

      role:
        "driver"
    },

    {
      $set: {
        currentLocation:
          location,

        lastSeenAt:
          location.updatedAt ||
          new Date()
      }
    }
  );

  return true;
}

async function updateRideLocationScalable({
  bookingId,
  driverId,
  location,
  allowedStatuses
}) {
  if (!liveLocationEnabled()) {
    return null;
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return null;
  }

  try {
    const access =
      await getRideAccess({
        redis,
        bookingId,
        driverId,
        allowedStatuses
      });

    if (!access) {
      return {
        handled: true,
        allowed: false,
        booking: null,
        location
      };
    }

    await cacheLocation({
      redis,
      bookingId,
      driverId,
      location
    });

    const persist =
      await shouldPersist({
        redis,
        bookingId,
        driverId
      });

    if (persist) {
      const persisted =
        await persistLocation({
          bookingId,
          driverId,
          location,
          allowedStatuses
        });

      if (!persisted) {
        await redis.del(
          rideAccessKey(
            bookingId,
            driverId
          )
        );

        return {
          handled: true,
          allowed: false,
          booking: null,
          location
        };
      }
    }

    return {
      handled: true,
      allowed: true,
      persisted:
        persist,

      location,

      booking: {
        _id:
          access._id,

        customer:
          access.customer,

        driver:
          access.driver,

        status:
          access.status,

        driverLocation:
          location
      }
    };
  } catch (error) {
    console.error(
      "[LiveLocationCache] Redis fast path failed; MongoDB fallback will be used:",
      error?.message || error
    );

    return null;
  }
}

async function updateKnownBookingLocationScalable({
  booking,
  driverId,
  location
}) {
  if (
    !booking ||
    !liveLocationEnabled()
  ) {
    return null;
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return null;
  }

  try {
    const bookingId =
      getId(booking._id);

    await cacheLocation({
      redis,
      bookingId,
      driverId,
      location
    });

    const persist =
      await shouldPersist({
        redis,
        bookingId,
        driverId
      });

    if (persist) {
      booking.driverLocation =
        location;

      await booking.save();
    }

    return {
      handled: true,
      persisted:
        persist,
      location
    };
  } catch (error) {
    console.error(
      "[LiveLocationCache] Socket fast path failed; original save fallback will be used:",
      error?.message || error
    );

    return null;
  }
}

async function getCachedRideLocation(
  bookingId
) {
  if (!liveLocationEnabled()) {
    return null;
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return null;
  }

  try {
    return await getJson(
      redis,
      rideLocationKey(
        bookingId
      )
    );
  } catch (error) {
    return null;
  }
}

function getLiveLocationCacheStatus() {
  return {
    enabled:
      scalability.liveLocation
        .cacheEnabled,

    active:
      liveLocationEnabled(),

    cacheTtlSeconds:
      scalability.liveLocation
        .cacheTtlSeconds,

    rideAccessTtlSeconds:
      scalability.liveLocation
        .rideAccessTtlSeconds,

    mongoPersistIntervalMs:
      scalability.liveLocation
        .mongoPersistIntervalMs
  };
}

module.exports = {
  liveLocationEnabled,
  updateRideLocationScalable,
  updateKnownBookingLocationScalable,
  getCachedRideLocation,
  getLiveLocationCacheStatus
};
