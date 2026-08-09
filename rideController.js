const rideService = require("../services/rideService");

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

function getAuthenticatedUser(req) {
  const user = req.user;

  if (!user) {
    throw createError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const userId =
    user._id ||
    user.id ||
    user.userId;

  if (!userId) {
    throw createError(
      "Authenticated user ID is missing",
      401,
      "INVALID_AUTHENTICATED_USER"
    );
  }

  return {
    userId,
    role: user.role
  };
}

function requireRole(
  role,
  allowedRoles,
  message
) {
  if (!allowedRoles.includes(role)) {
    throw createError(
      message || "Access denied",
      403,
      "ACCESS_DENIED"
    );
  }
}

function sendSuccess(
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null
  } = {}
) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data
  });
}

function getBookingId(req) {
  return (
    req.params.bookingId ||
    req.params.rideId ||
    req.params.id
  );
}

/*
|--------------------------------------------------------------------------
| Create Ride
|--------------------------------------------------------------------------
*/

async function createRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["customer"],
      "Only customers can create rides"
    );

    const {
      pickup,
      dropoff,
      pickupCoordinates,
      dropCoordinates,
      travelDate,
      passengers,
      vehicleType,
      distanceKm,
      distance,
      estimatedDurationMinutes,
      routePolyline,
      fare,
      estimatedFare,
      paymentMethod,
      note
    } = req.body;

    const result =
      await rideService.createRide({
        customerId: userId,

        pickup,
        dropoff,

        pickupCoordinates,
        dropCoordinates,

        travelDate,

        passengers:
          passengers === undefined
            ? 1
            : passengers,

        vehicleType:
          vehicleType || "hatchback",

        distanceKm:
          distanceKm === undefined
            ? null
            : distanceKm,

        distance:
          distance === undefined
            ? null
            : distance,

        estimatedDurationMinutes:
          estimatedDurationMinutes ===
          undefined
            ? 0
            : estimatedDurationMinutes,

        routePolyline:
          routePolyline || "",

        fare:
          fare &&
          typeof fare === "object"
            ? fare
            : null,

        estimatedFare:
          estimatedFare === undefined
            ? null
            : estimatedFare,

        paymentMethod:
          paymentMethod || "cash",

        note:
          typeof note === "string"
            ? note
            : ""
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Ride booked successfully",
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get My Rides
|--------------------------------------------------------------------------
*/

async function getMyRides(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      [
        "customer",
        "driver",
        "admin"
      ],
      "You cannot access ride history"
    );

    const result =
      await rideService.getMyRides({
        userId,
        role,

        page:
          req.query.page || 1,

        limit:
          req.query.limit || 20,

        status:
          req.query.status || null
      });

    return sendSuccess(res, {
      message:
        "Rides fetched successfully",
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Ride By ID
|--------------------------------------------------------------------------
*/

async function getRideById(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    const booking =
      await rideService.getRideById({
        bookingId:
          getBookingId(req),
        userId,
        role
      });

    return sendSuccess(res, {
      message:
        "Ride fetched successfully",
      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Customer Active Ride
|--------------------------------------------------------------------------
*/

async function getCustomerActiveRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["customer", "admin"],
      "Only customers can access customer active rides"
    );

    const customerId =
      role === "admin" &&
      req.params.customerId
        ? req.params.customerId
        : userId;

    const booking =
      await rideService.getCustomerActiveRide(
        customerId
      );

    return sendSuccess(res, {
      message: booking
        ? "Active ride fetched successfully"
        : "No active ride found",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Driver Active Ride
|--------------------------------------------------------------------------
*/

async function getDriverActiveRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver", "admin"],
      "Only drivers can access driver active rides"
    );

    const driverId =
      role === "admin" &&
      req.params.driverId
        ? req.params.driverId
        : userId;

    const booking =
      await rideService.getDriverActiveRide(
        driverId
      );

    return sendSuccess(res, {
      message: booking
        ? "Active ride fetched successfully"
        : "No active ride found",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Admin Customer Active Ride
|--------------------------------------------------------------------------
*/

async function adminGetCustomerActiveRide(
  req,
  res,
  next
) {
  try {
    const { role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["admin"],
      "Admin access required"
    );

    const booking =
      await rideService.getCustomerActiveRide(
        req.params.customerId
      );

    return sendSuccess(res, {
      message: booking
        ? "Customer active ride fetched successfully"
        : "Customer has no active ride",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Admin Driver Active Ride
|--------------------------------------------------------------------------
*/

async function adminGetDriverActiveRide(
  req,
  res,
  next
) {
  try {
    const { role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["admin"],
      "Admin access required"
    );

    const booking =
      await rideService.getDriverActiveRide(
        req.params.driverId
      );

    return sendSuccess(res, {
      message: booking
        ? "Driver active ride fetched successfully"
        : "Driver has no active ride",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Find Nearest Drivers
|--------------------------------------------------------------------------
*/

async function findNearestDrivers(
  req,
  res,
  next
) {
  try {
    const { role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["admin"],
      "Only admin can search nearby drivers"
    );

    const drivers =
      await rideService.findNearestDrivers({
        bookingId:
          getBookingId(req),

        radiusMeters:
          req.query.radiusMeters,

        limit:
          req.query.limit
      });

    return sendSuccess(res, {
      message:
        "Nearby drivers fetched successfully",

      data: {
        drivers,
        count: drivers.length
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Dispatch Ride
|--------------------------------------------------------------------------
*/

async function dispatchRide(
  req,
  res,
  next
) {
  try {
    const { role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["admin"],
      "Only admin can manually dispatch rides"
    );

    const result =
      await rideService.dispatchRide({
        bookingId:
          getBookingId(req),

        radiusMeters:
          req.body.radiusMeters,

        limit:
          req.body.limit,

        timeoutSeconds:
          req.body.timeoutSeconds
      });

    return sendSuccess(res, {
      message:
        result.message ||
        "Ride dispatched successfully",

      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Accept Ride
|--------------------------------------------------------------------------
*/

async function acceptRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only drivers can accept rides"
    );

    const result =
      await rideService.acceptRide({
        bookingId:
          getBookingId(req),

        driverId: userId
      });

    return sendSuccess(res, {
      message:
        "Ride accepted successfully",

      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Reject Ride
|--------------------------------------------------------------------------
*/

async function rejectRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only drivers can reject rides"
    );

    const result =
      await rideService.rejectRide({
        bookingId:
          getBookingId(req),

        driverId: userId
      });

    return sendSuccess(res, {
      message:
        "Ride request rejected successfully",

      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Expire Driver Requests
|--------------------------------------------------------------------------
*/

async function expireDriverRequests(
  req,
  res,
  next
) {
  try {
    const { role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["admin"],
      "Only admin can expire driver requests"
    );

    const result =
      await rideService.expireDriverRequests(
        getBookingId(req)
      );

    return sendSuccess(res, {
      message: result
        ? "Expired driver requests processed successfully"
        : "No active dispatch request found",

      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Expire Booking
|--------------------------------------------------------------------------
*/

async function expireBooking(
  req,
  res,
  next
) {
  try {
    const { role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["admin"],
      "Only admin can expire bookings"
    );

    const booking =
      await rideService.expireBooking(
        getBookingId(req)
      );

    return sendSuccess(res, {
      message: booking
        ? "Booking expired successfully"
        : "Booking is not eligible for expiry",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Mark Driver Arriving
|--------------------------------------------------------------------------
*/

async function markDriverArriving(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only drivers can update arrival status"
    );

    const booking =
      await rideService.markDriverArriving({
        bookingId:
          getBookingId(req),

        driverId: userId
      });

    return sendSuccess(res, {
      message:
        "Driver arrival started successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Mark Driver Arrived
|--------------------------------------------------------------------------
*/

async function markDriverArrived(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only drivers can mark arrival"
    );

    const booking =
      await rideService.markDriverArrived({
        bookingId:
          getBookingId(req),

        driverId: userId
      });

    return sendSuccess(res, {
      message:
        "Driver marked as arrived successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Verify Ride Start OTP
|--------------------------------------------------------------------------
*/

async function verifyRideStartOtp(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only the assigned driver can verify the ride OTP"
    );

    const booking =
      await rideService.verifyRideStartOtp({
        bookingId:
          getBookingId(req),

        driverId: userId,

        otp: req.body.otp
      });

    return sendSuccess(res, {
      message:
        "Ride start OTP verified successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Regenerate Start OTP
|--------------------------------------------------------------------------
*/

async function regenerateRideStartOtp(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    const result =
      await rideService.regenerateRideStartOtp({
        bookingId:
          getBookingId(req),

        userId,
        role
      });

    return sendSuccess(res, {
      message:
        "Ride start OTP regenerated successfully",

      data: result
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Start Ride
|--------------------------------------------------------------------------
*/

async function startRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only the assigned driver can start the ride"
    );

    const booking =
      await rideService.startRide({
        bookingId:
          getBookingId(req),

        driverId: userId
      });

    return sendSuccess(res, {
      message:
        "Ride started successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Driver Location
|--------------------------------------------------------------------------
*/

async function updateDriverLocation(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only drivers can update live ride location"
    );

    const {
      latitude,
      longitude,
      heading,
      speed,
      accuracy
    } = req.body;

    const booking =
      await rideService.updateDriverLocation({
        bookingId:
          getBookingId(req),

        driverId: userId,

        latitude,
        longitude,

        heading:
          heading === undefined
            ? null
            : heading,

        speed:
          speed === undefined
            ? null
            : speed,

        accuracy:
          accuracy === undefined
            ? null
            : accuracy
      });

    return sendSuccess(res, {
      message:
        "Driver location updated successfully",

      data: {
        bookingId:
          booking._id,

        driverLocation:
          booking.driverLocation,

        status:
          booking.status
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Complete Ride
|--------------------------------------------------------------------------
*/

async function completeRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only the assigned driver can complete the ride"
    );

    const {
      actualDistanceKm,
      actualDurationMinutes,
      finalFare
    } = req.body;

    const booking =
      await rideService.completeRide({
        bookingId:
          getBookingId(req),

        driverId: userId,

        actualDistanceKm:
          actualDistanceKm ===
          undefined
            ? null
            : actualDistanceKm,

        actualDurationMinutes:
          actualDurationMinutes ===
          undefined
            ? null
            : actualDurationMinutes,

        finalFare:
          finalFare === undefined
            ? null
            : finalFare
      });

    return sendSuccess(res, {
      message:
        "Ride completed successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Cancel Ride
|--------------------------------------------------------------------------
*/

async function cancelRide(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    const {
      reason,
      cancellationCharge
    } = req.body;

    const booking =
      await rideService.cancelRide({
        bookingId:
          getBookingId(req),

        userId,
        role,

        reason:
          typeof reason === "string"
            ? reason
            : "",

        cancellationCharge:
          cancellationCharge ===
          undefined
            ? 0
            : cancellationCharge
      });

    return sendSuccess(res, {
      message:
        "Ride cancelled successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Rate Driver
|--------------------------------------------------------------------------
*/

async function rateDriver(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["customer"],
      "Only customers can rate drivers"
    );

    const {
      rating,
      review
    } = req.body;

    const booking =
      await rideService.rateDriver({
        bookingId:
          getBookingId(req),

        customerId:
          userId,

        rating,

        review:
          typeof review === "string"
            ? review
            : ""
      });

    return sendSuccess(res, {
      message:
        "Driver rated successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Rate Customer
|--------------------------------------------------------------------------
*/

async function rateCustomer(
  req,
  res,
  next
) {
  try {
    const { userId, role } =
      getAuthenticatedUser(req);

    requireRole(
      role,
      ["driver"],
      "Only drivers can rate customers"
    );

    const {
      rating,
      review
    } = req.body;

    const booking =
      await rideService.rateCustomer({
        bookingId:
          getBookingId(req),

        driverId:
          userId,

        rating,

        review:
          typeof review === "string"
            ? review
            : ""
      });

    return sendSuccess(res, {
      message:
        "Customer rated successfully",

      data: {
        booking
      }
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  createRide,
  getMyRides,
  getRideById,

  getCustomerActiveRide,
  getDriverActiveRide,

  adminGetCustomerActiveRide,
  adminGetDriverActiveRide,

  findNearestDrivers,
  dispatchRide,

  acceptRide,
  rejectRide,

  expireDriverRequests,
  expireBooking,

  markDriverArriving,
  markDriverArrived,

  verifyRideStartOtp,
  regenerateRideStartOtp,

  startRide,
  updateDriverLocation,
  completeRide,
  cancelRide,

  rateDriver,
  rateCustomer
};