const mongoose = require("mongoose");

const Booking = require(
  "../models/Booking"
);

const User = require(
  "../models/User"
);

const rideService = require(
  "../services/rideService"
);

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ACTIVE_DRIVER_RIDE_STATUSES = [
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "started"
];

const AVAILABLE_RIDE_STATUSES = [
  "pending",
  "searching_driver"
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function createError(
  message,
  statusCode = 400,
  code = "REQUEST_ERROR"
) {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.code = code;

  return error;
}

function getUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId
  );
}

function getUserRole(req) {
  return String(
    req.user?.role || ""
  )
    .trim()
    .toLowerCase();
}

function getBookingId(req) {
  return (
    req.params.bookingId ||
    req.params.rideId ||
    req.params.id
  );
}

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    String(value || "")
  );
}

function isDriverApproved(driver) {
  return Boolean(
    driver?.driverProfile?.isApproved === true ||
      driver?.driverProfile?.approvalStatus ===
        "approved" ||
      driver?.approved === true
  );
}

function isDriverAccountAllowed(driver) {
  if (!driver) {
    return false;
  }

  if (driver.isActive === false) {
    return false;
  }

  return ![
    "blocked",
    "suspended",
    "deleted",
    "inactive"
  ].includes(
    String(
      driver.accountStatus || "active"
    ).toLowerCase()
  );
}

/*
|--------------------------------------------------------------------------
| Repair Stale Driver Ride State
|--------------------------------------------------------------------------
*/

async function repairDriverRideState(
  driver
) {
  if (!driver?.currentRide) {
    return driver;
  }

  const activeRide =
    await Booking.findOne({
      _id: driver.currentRide,
      driver: driver._id,

      status: {
        $in:
          ACTIVE_DRIVER_RIDE_STATUSES
      }
    }).select("_id status");

  if (activeRide) {
    return driver;
  }

  driver.currentRide = null;

  if (driver.isOnline) {
    driver.isAvailable = true;
  }

  driver.lastSeenAt = new Date();

  await driver.save();

  return driver;
}

/*
|--------------------------------------------------------------------------
| Verify Driver
|--------------------------------------------------------------------------
*/

async function getApprovedDriver(req) {
  const driverId = getUserId(req);

  const role =
    getUserRole(req);

  if (
    role !== "driver" ||
    !validObjectId(driverId)
  ) {
    throw createError(
      "Only drivers can access ride requests",
      403,
      "DRIVER_ONLY"
    );
  }

  const driver =
    await User.findOne({
      _id: driverId,
      role: "driver"
    });

  if (!driver) {
    throw createError(
      "Driver account nahi mila",
      404,
      "DRIVER_NOT_FOUND"
    );
  }

  if (
    !isDriverAccountAllowed(
      driver
    )
  ) {
    throw createError(
      "Driver account active nahi hai",
      403,
      "DRIVER_ACCOUNT_INACTIVE"
    );
  }

  if (!isDriverApproved(driver)) {
    throw createError(
      "Approved driver account required hai",
      403,
      "DRIVER_NOT_APPROVED"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Legacy Approval Compatibility
  |--------------------------------------------------------------------------
  */

  let needsSave = false;

  if (
    driver.driverProfile &&
    driver.driverProfile.isApproved !==
      true
  ) {
    driver.driverProfile.isApproved =
      true;

    needsSave = true;
  }

  if (
    driver.driverProfile &&
    driver.driverProfile.approvalStatus !==
      "approved"
  ) {
    driver.driverProfile.approvalStatus =
      "approved";

    needsSave = true;
  }

  if (
    driver.accountStatus !==
    "active"
  ) {
    driver.accountStatus =
      "active";

    needsSave = true;
  }

  if (needsSave) {
    await driver.save();
  }

  await repairDriverRideState(
    driver
  );

  return driver;
}

/*
|--------------------------------------------------------------------------
| Add Driver To Dispatch Queue
|--------------------------------------------------------------------------
*/

async function prepareDriverRequest({
  bookingId,
  driver
}) {
  if (!validObjectId(bookingId)) {
    throw createError(
      "Invalid booking ID",
      400,
      "INVALID_BOOKING_ID"
    );
  }

  await repairDriverRideState(
    driver
  );

  if (
    !driver.isOnline ||
    !driver.isAvailable ||
    driver.currentRide
  ) {
    throw createError(
      "Ride accept karne ke liye driver online aur available hona chahiye",
      409,
      "DRIVER_NOT_AVAILABLE"
    );
  }

  const booking =
    await Booking.findOne({
      _id: bookingId,

      driver: null,

      status: {
        $in:
          AVAILABLE_RIDE_STATUSES
      },

      rejectedDrivers: {
        $ne: driver._id
      }
    });

  if (!booking) {
    throw createError(
      "Ride request ab available nahi hai",
      409,
      "RIDE_NOT_AVAILABLE"
    );
  }

  const now =
    new Date();

  const expiresAt =
    new Date(
      now.getTime() +
        2 * 60 * 1000
    );

  const existingRequest =
    booking.dispatchQueue.find(
      (request) =>
        String(
          request.driver
        ) ===
        String(
          driver._id
        )
    );

  if (existingRequest) {
    existingRequest.status =
      "pending";

    existingRequest.notifiedAt =
      now;

    existingRequest.expiresAt =
      expiresAt;
  } else {
    booking.dispatchQueue.push({
      driver:
        driver._id,

      notifiedAt:
        now,

      expiresAt,

      status:
        "pending",

      distanceKm:
        0,

      etaMinutes:
        0
    });
  }

  booking.status =
    "searching_driver";

  await booking.save();

  return booking;
}

/*
|--------------------------------------------------------------------------
| Driver Ride Feed
|--------------------------------------------------------------------------
*/

async function getDriverRideFeed(
  req,
  res,
  next
) {
  try {
    const driver =
      await getApprovedDriver(
        req
      );

    const page =
      Math.max(
        Number(
          req.query.page
        ) || 1,
        1
      );

    const limit =
      Math.min(
        Math.max(
          Number(
            req.query.limit
          ) || 50,
          1
        ),
        100
      );

    const requestedStatus =
      String(
        req.query.status || ""
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | Driver ki apni rides
    |--------------------------------------------------------------------------
    */

    const assignedRideFilter = {
      driver:
        driver._id
    };

    /*
    |--------------------------------------------------------------------------
    | Customer ki new unassigned rides
    |--------------------------------------------------------------------------
    */

    const availableRideFilter = {
      driver: null,

      status: {
        $in:
          AVAILABLE_RIDE_STATUSES
      },

      rejectedDrivers: {
        $ne:
          driver._id
      }
    };

    const filter = {
      $or: [
        assignedRideFilter,
        availableRideFilter
      ]
    };

    if (requestedStatus) {
      filter.status =
        requestedStatus;
    }

    const [
      bookings,
      total
    ] =
      await Promise.all([
        Booking.find(
          filter
        )
          .sort({
            updatedAt: -1,
            createdAt: -1
          })
          .skip(
            (page - 1) *
              limit
          )
          .limit(
            limit
          )
          .populate(
            "customer",
            [
              "name",
              "phone",
              "alternativePhone",
              "profileImage"
            ].join(" ")
          )
          .populate(
            "driver",
            [
              "name",
              "phone",
              "alternativePhone",
              "profileImage",
              "driverProfile",
              "currentLocation",
              "isOnline",
              "isAvailable"
            ].join(" ")
          ),

        Booking.countDocuments(
          filter
        )
      ]);

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver rides fetched successfully",

        /*
        |--------------------------------------------------------------------------
        | Direct bookings compatibility
        |--------------------------------------------------------------------------
        */

        bookings,

        data: {
          bookings,

          driver: {
            _id:
              driver._id,

            isOnline:
              Boolean(
                driver.isOnline
              ),

            isAvailable:
              Boolean(
                driver.isAvailable
              ),

            currentRide:
              driver.currentRide ||
              null,

            approved:
              true
          },

          pagination: {
            page,

            limit,

            total,

            totalPages:
              Math.ceil(
                total /
                  limit
              )
          }
        }
      });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Accept Available Ride
|--------------------------------------------------------------------------
*/

async function acceptAvailableRide(
  req,
  res,
  next
) {
  try {
    const driver =
      await getApprovedDriver(
        req
      );

    const bookingId =
      getBookingId(
        req
      );

    await prepareDriverRequest({
      bookingId,
      driver
    });

    const result =
      await rideService.acceptRide({
        bookingId,

        driverId:
          driver._id
      });

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Ride accepted successfully",

        booking:
          result?.booking ||
          null,

        data:
          result
      });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Reject Available Ride
|--------------------------------------------------------------------------
*/

async function rejectAvailableRide(
  req,
  res,
  next
) {
  try {
    const driver =
      await getApprovedDriver(
        req
      );

    const bookingId =
      getBookingId(
        req
      );

    await prepareDriverRequest({
      bookingId,
      driver
    });

    const result =
      await rideService.rejectRide({
        bookingId,

        driverId:
          driver._id
      });

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Ride request rejected successfully",

        booking:
          result?.booking ||
          null,

        data:
          result
      });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  getDriverRideFeed,
  acceptAvailableRide,
  rejectAvailableRide
};