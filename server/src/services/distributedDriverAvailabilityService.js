/*
|--------------------------------------------------------------------------
| HimRideG Distributed Driver Availability — Phase 3
|--------------------------------------------------------------------------
|
| ADD-ONLY scalability layer.
|
| Purpose:
| - Available drivers ka lightweight Redis GEO registry maintain karna.
| - Multi-instance backend me nearest-driver prefilter ko shared banana.
| - Redis unavailable/stale ho to existing MongoDB $geoNear logic ko preserve
|   karna. Redis kabhi source-of-truth nahi banta; MongoDB final authority hai.
|
| Safety:
| - Existing driver/customer/admin/payment/map/fare behavior replace nahi hota.
| - Redis write/read failure sirf warning deta hai; current MongoDB flow chalta
|   rahta hai.
|--------------------------------------------------------------------------
*/

const mongoose = require("mongoose");

const User = require("../models/User");
const scalability = require("../config/scalability");

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

function key(suffix) {
  return `${scalability.redis.keyPrefix}:${suffix}`;
}

function geoKey() {
  return key("drivers:available:geo");
}

function availableSetKey() {
  return key("drivers:available:set");
}

function driverStateKey(driverId) {
  return key(
    `drivers:availability:${getId(driverId)}`
  );
}

function availabilityEnabled() {
  return Boolean(
    scalability.distributedAvailability?.enabled &&
      isRedisReady()
  );
}

function validCoordinate(value) {
  return Number.isFinite(Number(value));
}

function getCoordinates(driver) {
  const longitude = Number(
    driver?.currentLocation?.longitude
  );

  const latitude = Number(
    driver?.currentLocation?.latitude
  );

  if (
    !validCoordinate(longitude) ||
    !validCoordinate(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    return null;
  }

  return {
    longitude,
    latitude
  };
}

function driverApproved(driver) {
  return Boolean(
    driver?.driverProfile?.isApproved === true ||
      driver?.driverProfile?.approvalStatus === "approved" ||
      driver?.approved === true
  );
}

function driverAccountActive(driver) {
  const status = String(
    driver?.accountStatus || "active"
  )
    .trim()
    .toLowerCase();

  return Boolean(
    driver &&
      driver.role === "driver" &&
      driver.isActive !== false &&
      ![
        "blocked",
        "suspended",
        "deleted",
        "inactive"
      ].includes(status)
  );
}

function locationFresh(driver) {
  const updatedAt =
    driver?.currentLocation?.updatedAt;

  if (!updatedAt) {
    return true;
  }

  const timestamp =
    new Date(updatedAt).getTime();

  if (!Number.isFinite(timestamp)) {
    return true;
  }

  const maxAgeMs =
    Number(
      scalability.distributedAvailability
        ?.locationStaleSeconds ||
        180
    ) * 1000;

  return (
    Date.now() - timestamp <=
    Math.max(15000, maxAgeMs)
  );
}

function driverCanBePublished(driver) {
  return Boolean(
    driverAccountActive(driver) &&
      driverApproved(driver) &&
      driver.isOnline === true &&
      driver.isAvailable === true &&
      !driver.currentRide &&
      getCoordinates(driver) &&
      locationFresh(driver)
  );
}

async function removeDriverAvailability(
  driverId
) {
  if (!availabilityEnabled()) {
    return {
      handled: false,
      removed: false
    };
  }

  const id = getId(driverId);
  const redis =
    getRedisCommandClient();

  if (!id || !redis) {
    return {
      handled: false,
      removed: false
    };
  }

  try {
    await Promise.all([
      redis.sendCommand([
        "ZREM",
        geoKey(),
        id
      ]),
      redis.sendCommand([
        "SREM",
        availableSetKey(),
        id
      ]),
      redis.del(
        driverStateKey(id)
      )
    ]);

    return {
      handled: true,
      removed: true
    };
  } catch (error) {
    console.error(
      "[DistributedAvailability] remove failed; MongoDB remains source-of-truth:",
      error?.message || error
    );

    return {
      handled: false,
      removed: false
    };
  }
}

async function publishDriverAvailability(
  driver
) {
  if (!availabilityEnabled()) {
    return {
      handled: false,
      published: false
    };
  }

  const id = getId(driver);

  if (!id) {
    return {
      handled: false,
      published: false
    };
  }

  if (!driverCanBePublished(driver)) {
    return removeDriverAvailability(
      id
    );
  }

  const coordinates =
    getCoordinates(driver);

  const redis =
    getRedisCommandClient();

  if (!redis || !coordinates) {
    return {
      handled: false,
      published: false
    };
  }

  const ttlSeconds =
    Math.max(
      30,
      Number(
        scalability.distributedAvailability
          ?.ttlSeconds ||
          120
      )
    );

  const payload = {
    driverId: id,
    longitude:
      coordinates.longitude,
    latitude:
      coordinates.latitude,
    isOnline:
      Boolean(driver.isOnline),
    isAvailable:
      Boolean(driver.isAvailable),
    currentRide:
      driver.currentRide
        ? getId(driver.currentRide)
        : null,
    locationUpdatedAt:
      driver?.currentLocation?.updatedAt ||
      null,
    syncedAt:
      new Date().toISOString()
  };

  try {
    await Promise.all([
      redis.sendCommand([
        "GEOADD",
        geoKey(),
        String(
          coordinates.longitude
        ),
        String(
          coordinates.latitude
        ),
        id
      ]),
      redis.sendCommand([
        "SADD",
        availableSetKey(),
        id
      ]),
      redis.set(
        driverStateKey(id),
        JSON.stringify(payload),
        {
          EX: ttlSeconds
        }
      )
    ]);

    return {
      handled: true,
      published: true,
      driverId: id
    };
  } catch (error) {
    console.error(
      "[DistributedAvailability] publish failed; MongoDB fallback preserved:",
      error?.message || error
    );

    return {
      handled: false,
      published: false
    };
  }
}

async function syncDriverAvailabilityById(
  driverId
) {
  if (!availabilityEnabled()) {
    return {
      handled: false,
      published: false
    };
  }

  const id = getId(driverId);

  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return {
      handled: false,
      published: false
    };
  }

  try {
    const driver =
      await User.findOne({
        _id: id,
        role: "driver"
      }).select(
        [
          "_id",
          "role",
          "isActive",
          "accountStatus",
          "isOnline",
          "isAvailable",
          "currentRide",
          "currentLocation",
          "driverProfile.isApproved",
          "driverProfile.approvalStatus",
          "approved"
        ].join(" ")
      );

    if (!driver) {
      return removeDriverAvailability(
        id
      );
    }

    return publishDriverAvailability(
      driver
    );
  } catch (error) {
    console.error(
      "[DistributedAvailability] sync-by-id failed:",
      error?.message || error
    );

    return {
      handled: false,
      published: false
    };
  }
}

async function findNearestAvailableDriverIds({
  longitude,
  latitude,
  radiusMeters,
  limit,
  excludeIds = []
}) {
  if (
    !availabilityEnabled() ||
    !scalability.distributedAvailability
      ?.redisPrefilterEnabled
  ) {
    return null;
  }

  const redis =
    getRedisCommandClient();

  if (!redis) {
    return null;
  }

  const lon = Number(longitude);
  const lat = Number(latitude);

  if (
    !Number.isFinite(lon) ||
    !Number.isFinite(lat)
  ) {
    return null;
  }

  const safeRadius =
    Math.max(
      100,
      Number(radiusMeters) ||
        15000
    );

  const safeLimit =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      50
    );

  const candidateCount =
    Math.min(
      100,
      Math.max(
        safeLimit * 3,
        safeLimit
      )
    );

  const excluded =
    new Set(
      (excludeIds || []).map(
        (value) => getId(value)
      )
    );

  try {
    const ids =
      await redis.sendCommand([
        "GEOSEARCH",
        geoKey(),
        "FROMLONLAT",
        String(lon),
        String(lat),
        "BYRADIUS",
        String(safeRadius),
        "m",
        "ASC",
        "COUNT",
        String(candidateCount)
      ]);

    if (!Array.isArray(ids)) {
      return [];
    }

    const normalized = ids
      .map((value) => getId(value))
      .filter(Boolean)
      .filter(
        (id) => !excluded.has(id)
      );

    if (!normalized.length) {
      return [];
    }

    const memberships =
      await Promise.all(
        normalized.map(
          async (id) => {
            try {
              const [
                member,
                stateExists
              ] = await Promise.all([
                redis.sendCommand([
                  "SISMEMBER",
                  availableSetKey(),
                  id
                ]),
                redis.sendCommand([
                  "EXISTS",
                  driverStateKey(id)
                ])
              ]);

              const available =
                Number(member) === 1 &&
                Number(stateExists) === 1;

              if (!available) {
                Promise.all([
                  redis.sendCommand([
                    "ZREM",
                    geoKey(),
                    id
                  ]),
                  redis.sendCommand([
                    "SREM",
                    availableSetKey(),
                    id
                  ])
                ]).catch(() => null);
              }

              return {
                id,
                available
              };
            } catch (error) {
              // Redis membership verification itself fail ho to MongoDB final
              // authority candidate ko validate karegi; false-negative avoid.
              return {
                id,
                available: true
              };
            }
          }
        )
      );

    return memberships
      .filter(
        (item) => item.available
      )
      .map((item) => item.id)
      .slice(0, safeLimit);
  } catch (error) {
    console.error(
      "[DistributedAvailability] GEOSEARCH failed; MongoDB $geoNear fallback active:",
      error?.message || error
    );

    return null;
  }
}

async function warmDistributedAvailabilityRegistry() {
  if (!availabilityEnabled()) {
    return {
      handled: false,
      scanned: 0,
      published: 0
    };
  }

  const limit =
    Math.max(
      100,
      Number(
        scalability.distributedAvailability
          ?.warmupLimit ||
          5000
      )
    );

  let scanned = 0;
  let published = 0;
  let batch = [];

  const flush = async () => {
    if (!batch.length) {
      return;
    }

    const results =
      await Promise.all(
        batch.map((driver) =>
          publishDriverAvailability(
            driver
          )
        )
      );

    published +=
      results.filter(
        (result) =>
          result?.published === true
      ).length;

    batch = [];
  };

  try {
    const cursor = User.find({
      role: "driver",
      isActive: true,
      accountStatus: "active",
      isOnline: true,
      isAvailable: true,
      currentRide: null,
      "driverProfile.isApproved": true,
      "currentLocation.latitude": {
        $type: "number"
      },
      "currentLocation.longitude": {
        $type: "number"
      }
    })
      .select(
        "_id role isActive accountStatus isOnline isAvailable currentRide currentLocation driverProfile.isApproved driverProfile.approvalStatus approved"
      )
      .limit(limit)
      .cursor();

    for await (const driver of cursor) {
      scanned += 1;
      batch.push(driver);

      if (batch.length >= 50) {
        await flush();
      }
    }

    await flush();

    return {
      handled: true,
      scanned,
      published
    };
  } catch (error) {
    console.error(
      "[DistributedAvailability] startup warmup failed; live sync + MongoDB fallback remain active:",
      error?.message || error
    );

    return {
      handled: false,
      scanned,
      published
    };
  }
}

function getDistributedAvailabilityStatus() {
  return {
    enabled:
      Boolean(
        scalability.distributedAvailability
          ?.enabled
      ),
    active:
      availabilityEnabled(),
    redisPrefilterEnabled:
      Boolean(
        scalability.distributedAvailability
          ?.redisPrefilterEnabled
      ),
    ttlSeconds:
      Number(
        scalability.distributedAvailability
          ?.ttlSeconds ||
          120
      ),
    locationStaleSeconds:
      Number(
        scalability.distributedAvailability
          ?.locationStaleSeconds ||
          180
      ),
    mongoAuthority:
      true
  };
}

module.exports = {
  availabilityEnabled,
  driverCanBePublished,
  publishDriverAvailability,
  removeDriverAvailability,
  syncDriverAvailabilityById,
  findNearestAvailableDriverIds,
  warmDistributedAvailabilityRegistry,
  getDistributedAvailabilityStatus
};
