const mongoose = require("mongoose");

const User = require("../models/User");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");

// Phase 3: distributed available-driver registry. Redis unavailable ho to
// helper silently MongoDB source-of-truth ko preserve karta hai.
const {
  publishDriverAvailability
} = require(
  "./distributedDriverAvailabilityService"
);

function syncDistributedAvailability(
  driver
) {
  Promise.resolve(
    publishDriverAvailability(
      driver
    )
  ).catch((error) => {
    console.error(
      "[DriverService distributed availability sync error]",
      error?.message || error
    );
  });
}

const ACTIVE_RIDE_STATUSES = [
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "started"
];

/*
|--------------------------------------------------------------------------
| Cash Commission Due Ride Gate
|--------------------------------------------------------------------------
| Latest production rule: cash commission due wallet me ledger ke roop me
| rahega aur future wallet/online earning se recover ho sakta hai, lekin ek
| completed cash ride ke baad driver ko next ride lene se block nahi karega.
| Original gate code preserve hai aur flag se disabled rakha gaya hai.
|--------------------------------------------------------------------------
*/
const COMMISSION_DUE_BLOCKS_NEW_RIDES = false;

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
| Availability Blocking Ride
|--------------------------------------------------------------------------
| Active fare/ride stages ke saath completed-but-unpaid ride bhi driver ko
| new request ke liye unavailable rakhegi. Offline toggle ko unnecessarily
| block nahi kiya jata; ye helper sirf new-ride availability decisions me hai.
*/
async function getAvailabilityBlockingRide(driverId) {
  return Booking.findOne({
    driver: driverId,
    $or: [
      {
        status: {
          $in: ACTIVE_RIDE_STATUSES
        }
      },
      {
        status: "completed",
        paymentStatus: {
          $ne: "paid"
        }
      }
    ]
  })
    .sort({
      updatedAt: -1
    })
    .select("_id status paymentStatus");
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
    await getAvailabilityBlockingRide(driverId);

  const commissionDue =
    Number(
      driver.wallet
        ?.commissionDue ||
        0
    );

  driver.isOnline = true;

  /*
  |--------------------------------------------------------------------------
  | Cash Commission Due Gate
  |--------------------------------------------------------------------------
  |
  | Driver online reh sakta hai, lekin platform commission due hone par
  | new ride ke liye available nahi hoga.
  |
  */

  driver.isAvailable =
    !currentRide &&
    (
      !COMMISSION_DUE_BLOCKS_NEW_RIDES ||
      commissionDue <= 0
    );

  driver.lastSeenAt =
    new Date();

  await driver.save();

  syncDistributedAvailability(
    driver
  );

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

  syncDistributedAvailability(
    driver
  );

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

  const commissionDue =
    Number(
      driver.wallet
        ?.commissionDue ||
        0
    );

  if (
    COMMISSION_DUE_BLOCKS_NEW_RIDES &&
    commissionDue > 0
  ) {
    throw new ApiError(
      409,
      `₹${commissionDue} platform commission due hai. Wallet top-up karke due clear karo.`
    );
  }

  const currentRide =
    await getAvailabilityBlockingRide(driverId);

  if (currentRide) {
    throw new ApiError(
      400,
      currentRide.status === "completed"
        ? "Payment confirmation pending hai. Payment receive hone ke baad next ride available hogi"
        : "Driver cannot become available during an active ride"
    );
  }

  driver.isAvailable = true;
  driver.currentRide = null;
  driver.lastSeenAt = new Date();

  await driver.save();

  syncDistributedAvailability(
    driver
  );

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

  syncDistributedAvailability(
    driver
  );

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

  syncDistributedAvailability(
    driver
  );

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