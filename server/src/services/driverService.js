const mongoose = require("mongoose");

const User = require("../models/User");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");

const ACTIVE_RIDE_STATUSES = [
  "accepted",
  "driver_arriving",
  "driver_arrived",
  "started"
];

/*
|--------------------------------------------------------------------------
| Get Driver By ID
|--------------------------------------------------------------------------
*/

async function getDriverById(driverId) {
  if (
    !mongoose.Types.ObjectId.isValid(
      driverId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid driver ID"
    );
  }

  const driver = await User.findById(
    driverId
  );

  if (!driver) {
    throw new ApiError(
      404,
      "Driver account not found"
    );
  }

  if (driver.role !== "driver") {
    throw new ApiError(
      403,
      "This account is not a driver account"
    );
  }

  if (!driver.isActive) {
    throw new ApiError(
      403,
      "Driver account is inactive"
    );
  }

  return driver;
}

/*
|--------------------------------------------------------------------------
| Today Date Range
|--------------------------------------------------------------------------
*/

function getTodayRange() {
  const startOfDay = new Date();

  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  const endOfDay = new Date();

  endOfDay.setHours(
    23,
    59,
    59,
    999
  );

  return {
    startOfDay,
    endOfDay
  };
}

/*
|--------------------------------------------------------------------------
| Get Driver Current Ride
|--------------------------------------------------------------------------
*/

async function getCurrentRide(driverId) {
  return Booking.findOne({
    driver: driverId,

    status: {
      $in: ACTIVE_RIDE_STATUSES
    }
  })
    .sort({
      updatedAt: -1
    })
    .populate(
      "customer",
      "name phone profileImage"
    );
}

/*
|--------------------------------------------------------------------------
| Get Today Driver Statistics
|--------------------------------------------------------------------------
*/

async function getTodayStats(driverId) {
  const {
    startOfDay,
    endOfDay
  } = getTodayRange();

  const result =
    await Booking.aggregate([
      {
        $match: {
          driver:
            new mongoose.Types.ObjectId(
              driverId
            ),

          status: "completed",

          completedAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },

      {
        $group: {
          _id: null,

          todayTrips: {
            $sum: 1
          },

          todayEarnings: {
            $sum: {
              $ifNull: [
                "$fare.finalFare",
                {
                  $ifNull: [
                    "$fare.estimatedFare",
                    0
                  ]
                }
              ]
            }
          }
        }
      }
    ]);

  if (!result.length) {
    return {
      todayTrips: 0,
      todayEarnings: 0
    };
  }

  return {
    todayTrips:
      result[0].todayTrips || 0,

    todayEarnings:
      result[0].todayEarnings || 0
  };
}

/*
|--------------------------------------------------------------------------
| Get Driver Dashboard
|--------------------------------------------------------------------------
*/

async function getDriverDashboard(
  driverId
) {
  const driver = await getDriverById(
    driverId
  );

  const [
    currentRide,
    todayStats
  ] = await Promise.all([
    getCurrentRide(driverId),
    getTodayStats(driverId)
  ]);

  return {
    driver:
      typeof driver.toSafeObject ===
      "function"
        ? driver.toSafeObject()
        : driver,

    status: {
      isOnline:
        Boolean(driver.isOnline),

      isAvailable:
        Boolean(driver.isAvailable)
    },

    statistics: {
      todayTrips:
        todayStats.todayTrips,

      todayEarnings:
        todayStats.todayEarnings,

      rating:
        driver.driverProfile?.rating ||
        0,

      totalRides:
        driver.driverProfile
          ?.totalRides || 0
    },

    vehicle:
      driver.driverProfile?.vehicle ||
      null,

    wallet:
      driver.wallet || null,

    currentLocation:
      driver.currentLocation || null,

    currentRide
  };
}

/*
|--------------------------------------------------------------------------
| Set Driver Online
|--------------------------------------------------------------------------
*/

async function setDriverOnline(driverId) {
  const driver = await getDriverById(
    driverId
  );

  if (
    !driver.driverProfile?.isApproved
  ) {
    throw new ApiError(
      403,
      "Driver account must be approved before going online"
    );
  }

  const currentRide =
    await getCurrentRide(driverId);

  driver.isOnline = true;

  driver.isAvailable =
    !currentRide;

  driver.lastSeenAt =
    new Date();

  await driver.save();

  return driver;
}

/*
|--------------------------------------------------------------------------
| Set Driver Offline
|--------------------------------------------------------------------------
*/

async function setDriverOffline(driverId) {
  const driver = await getDriverById(
    driverId
  );

  const currentRide =
    await getCurrentRide(driverId);

  if (currentRide) {
    throw new ApiError(
      400,
      "Driver cannot go offline during an active ride"
    );
  }

  driver.isOnline = false;
  driver.isAvailable = false;
  driver.socketId = null;
  driver.lastSeenAt = new Date();

  await driver.save();

  return driver;
}

/*
|--------------------------------------------------------------------------
| Set Driver Available
|--------------------------------------------------------------------------
*/

async function setDriverAvailable(
  driverId
) {
  const driver = await getDriverById(
    driverId
  );

  if (!driver.isOnline) {
    throw new ApiError(
      400,
      "Driver must be online before becoming available"
    );
  }

  if (
    !driver.driverProfile?.isApproved
  ) {
    throw new ApiError(
      403,
      "Driver account is not approved"
    );
  }

  const currentRide =
    await getCurrentRide(driverId);

  if (currentRide) {
    throw new ApiError(
      400,
      "Driver cannot become available during an active ride"
    );
  }

  driver.isAvailable = true;
  driver.currentRide = null;
  driver.lastSeenAt = new Date();

  await driver.save();

  return driver;
}

/*
|--------------------------------------------------------------------------
| Set Driver Busy
|--------------------------------------------------------------------------
*/

async function setDriverBusy(driverId) {
  const driver = await getDriverById(
    driverId
  );

  driver.isAvailable = false;
  driver.lastSeenAt = new Date();

  await driver.save();

  return driver;
}

/*
|--------------------------------------------------------------------------
| Update Driver Location
|--------------------------------------------------------------------------
*/

async function updateDriverLocation(
  driverId,
  location
) {
  const driver = await getDriverById(
    driverId
  );

  const latitude = Number(
    location?.latitude
  );

  const longitude = Number(
    location?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new ApiError(
      400,
      "Valid latitude is required"
    );
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ApiError(
      400,
      "Valid longitude is required"
    );
  }

  const heading =
    location?.heading === undefined ||
    location?.heading === null ||
    location?.heading === ""
      ? null
      : Number(location.heading);

  const speed =
    location?.speed === undefined ||
    location?.speed === null ||
    location?.speed === ""
      ? null
      : Number(location.speed);

  const accuracy =
    location?.accuracy === undefined ||
    location?.accuracy === null ||
    location?.accuracy === ""
      ? null
      : Number(location.accuracy);

  const now = new Date();

  const currentLocation = {
    latitude,
    longitude,

    geo: {
      type: "Point",

      coordinates: [
        longitude,
        latitude
      ]
    },

    heading:
      Number.isFinite(heading)
        ? heading
        : null,

    speed:
      Number.isFinite(speed)
        ? speed
        : null,

    accuracy:
      Number.isFinite(accuracy)
        ? accuracy
        : null,

    updatedAt: now
  };

  driver.currentLocation =
    currentLocation;

  driver.lastSeenAt = now;

  await driver.save();

  const currentRide =
    await getCurrentRide(driverId);

  if (currentRide) {
    currentRide.driverLocation = {
      latitude,
      longitude,

      geo: {
        type: "Point",

        coordinates: [
          longitude,
          latitude
        ]
      },

      heading:
        currentLocation.heading,

      speed:
        currentLocation.speed,

      accuracy:
        currentLocation.accuracy,

      updatedAt: now
    };

    await currentRide.save();
  }

  return {
    driver,
    currentRide
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  getDriverById,
  getDriverDashboard,
  getCurrentRide,
  getTodayStats,
  setDriverOnline,
  setDriverOffline,
  setDriverAvailable,
  setDriverBusy,
  updateDriverLocation
};