const express = require("express");

const rideController = require(
  "../controllers/rideController"
);

const driverRideFeedController =
  require(
    "../controllers/driverRideFeedController"
  );

const User = require(
  "../models/User"
);

const {
  protect,
} = require("../middlewares/auth");

const {
  requirePlatformFeeBelowThreshold
} = require("../middlewares/platformFeeGate");

const {
  recoverExpiredRideFeed
} = require(
  "../middlewares/recoverExpiredRideFeed"
);

const {
  rideMutationLimiter,
  liveLocationLimiter
} = require(
  "../middlewares/rateLimits"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Protect All Ride Routes
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Ride Mutation Capacity Guard — ADD-ONLY
|--------------------------------------------------------------------------
| GET/feed/history behavior untouched. Logged-in user ID based limiter avoids
| carrier-NAT collisions. Live GPS gets its own higher-frequency bucket.
*/

router.use(
  (req, res, next) => {
    const isMutation =
      [
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
      ].includes(req.method);

    if (!isMutation) {
      return next();
    }

    if (
      /\/location\/?$/i.test(
        req.path
      )
    ) {
      return liveLocationLimiter(
        req,
        res,
        next
      );
    }

    return rideMutationLimiter(
      req,
      res,
      next
    );
  }
);

/*
|--------------------------------------------------------------------------
| Create Ride
|--------------------------------------------------------------------------
| POST /api/v2/rides
| Customer only
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  rideController.createRide
);

/*
|--------------------------------------------------------------------------
| Get All Rides
|--------------------------------------------------------------------------
| GET /api/v2/rides
| Admin only
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  (req, res, next) => {
    if (
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only admin can view all rides",
      });
    }

    return rideController.getMyRides(
      req,
      res,
      next
    );
  }
);

/*
|--------------------------------------------------------------------------
| Driver Ride Feed
|--------------------------------------------------------------------------
| This route must remain above dynamic routes.
| Expired dispatch entries no longer make an otherwise-active searching ride
| disappear from an online/available driver's list. Recovery middleware only
| adds recent unassigned rides after all pending dispatch windows have expired;
| accept endpoint still re-validates and atomically claims the ride.
|--------------------------------------------------------------------------
*/

router.get(
  "/driver/feed",
  recoverExpiredRideFeed,
  driverRideFeedController
    .getDriverRideFeed
);

/*
|--------------------------------------------------------------------------
| My Ride History / Driver Feed
|--------------------------------------------------------------------------
| Driver ko assigned aur available rides milengi.
| Customer aur admin ko normal history milegi.
|--------------------------------------------------------------------------
*/

router.get(
  "/mine",
  recoverExpiredRideFeed,
  (req, res, next) => {
    if (
      req.user?.role === "driver"
    ) {
      return driverRideFeedController
        .getDriverRideFeed(
          req,
          res,
          next
        );
    }

    return rideController.getMyRides(
      req,
      res,
      next
    );
  }
);

/*
|--------------------------------------------------------------------------
| Active Ride Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/customer/active",
  rideController
    .getCustomerActiveRide
);

router.get(
  "/driver/active",
  rideController
    .getDriverActiveRide
);

/*
|--------------------------------------------------------------------------
| Nearby Online Drivers — Customer Map
|--------------------------------------------------------------------------
| GET /api/v2/rides/online-drivers
|
| Query:
|   latitude / lat
|   longitude / lng / lon
|   radiusMeters (optional, default 25000, max 50000)
|   limit (optional, default 30, max 50)
|
| ADD-ONLY:
| - Existing ride routes untouched.
| - Only approved + active + online + available + free drivers are returned.
| - Private fields such as phone, email, documents and wallet are not returned.
| - This static route MUST remain above "/:bookingId".
|--------------------------------------------------------------------------
*/

router.get(
  "/online-drivers",
  async (req, res, next) => {
    try {
      if (
        ![
          "customer",
          "admin"
        ].includes(
          req.user?.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only customers and admin can view online drivers",
        });
      }

      const latitude =
        Number(
          req.query.latitude ??
          req.query.lat
        );

      const longitude =
        Number(
          req.query.longitude ??
          req.query.lng ??
          req.query.lon
        );

      const coordinatesValid =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      if (!coordinatesValid) {
        return res.status(400).json({
          success: false,
          message:
            "Valid latitude and longitude are required",
        });
      }

      const radiusMeters =
        Math.min(
          Math.max(
            Number(
              req.query.radiusMeters
            ) || 25000,
            100
          ),
          50000
        );

      const driverLimit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 30,
            1
          ),
          50
        );

      const drivers =
        await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [
                  longitude,
                  latitude
                ]
              },

              distanceField:
                "distanceMeters",

              spherical: true,

              maxDistance:
                radiusMeters,

              key:
                "currentLocation.geo",

              query: {
                role: "driver",

                isActive: true,

                accountStatus:
                  "active",

                isOnline: true,

                isAvailable: true,

                currentRide: null,

                "driverProfile.isApproved":
                  true
              }
            }
          },

          {
            $limit:
              driverLimit
          },

          {
            $project: {
              name: 1,
              profileImage: 1,

              isOnline: 1,
              isAvailable: 1,

              currentLocation: {
                latitude:
                  "$currentLocation.latitude",

                longitude:
                  "$currentLocation.longitude",

                heading:
                  "$currentLocation.heading",

                speed:
                  "$currentLocation.speed",

                accuracy:
                  "$currentLocation.accuracy",

                updatedAt:
                  "$currentLocation.updatedAt"
              },

              vehicle: {
                vehicleType:
                  "$driverProfile.vehicle.vehicleType",

                brand:
                  "$driverProfile.vehicle.brand",

                model:
                  "$driverProfile.vehicle.model",

                color:
                  "$driverProfile.vehicle.color",

                registrationNumber:
                  "$driverProfile.vehicle.registrationNumber"
              },

              rating:
                "$driverProfile.rating",

              ratingCount:
                "$driverProfile.ratingCount",

              distanceMeters: 1,

              distanceKm: {
                $round: [
                  {
                    $divide: [
                      "$distanceMeters",
                      1000
                    ]
                  },
                  2
                ]
              },

              etaMinutes: {
                $max: [
                  {
                    $ceil: {
                      $multiply: [
                        {
                          $divide: [
                            "$distanceMeters",
                            1000
                          ]
                        },
                        3
                      ]
                    }
                  },
                  1
                ]
              }
            }
          }
        ]);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Online drivers fetched successfully",

        data: {
          drivers,
          count:
            drivers.length
        }
      });
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin Active Ride Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/customer/:customerId/active",
  rideController
    .adminGetCustomerActiveRide
);

router.get(
  "/admin/driver/:driverId/active",
  rideController
    .adminGetDriverActiveRide
);

/*
|--------------------------------------------------------------------------
| Booking Expiry Routes
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/expire-driver-requests",
  rideController
    .expireDriverRequests
);

router.patch(
  "/:bookingId/expire",
  rideController.expireBooking
);

/*
|--------------------------------------------------------------------------
| Driver Search And Dispatch
|--------------------------------------------------------------------------
*/

router.get(
  "/:bookingId/nearest-drivers",
  rideController
    .findNearestDrivers
);

router.post(
  "/:bookingId/dispatch",
  rideController.dispatchRide
);

/*
|--------------------------------------------------------------------------
| Driver Accept Ride
|--------------------------------------------------------------------------
| PATCH backend support
| POST frontend compatibility support
| Platform-fee gate intentionally runs only at acceptance time so a driver
| with ₹100+ due can still SEE incoming ride requests, but cannot accept one
| until the outstanding HimRideG platform fee is paid below the threshold.
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/accept",
  requirePlatformFeeBelowThreshold,
  driverRideFeedController
    .acceptAvailableRide
);

router.post(
  "/:bookingId/accept",
  requirePlatformFeeBelowThreshold,
  driverRideFeedController
    .acceptAvailableRide
);

/*
|--------------------------------------------------------------------------
| Driver Reject Ride
|--------------------------------------------------------------------------
| PATCH backend support
| POST frontend compatibility support
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/reject",
  driverRideFeedController
    .rejectAvailableRide
);

router.post(
  "/:bookingId/reject",
  driverRideFeedController
    .rejectAvailableRide
);


/*
|--------------------------------------------------------------------------
| ADD-ONLY: Driver Release Accepted / Unconfirmed Ride
|--------------------------------------------------------------------------
*/
router.patch(
  "/:bookingId/driver-release",
  driverRideFeedController.releaseAcceptedRide
);

router.post(
  "/:bookingId/driver-release",
  driverRideFeedController.releaseAcceptedRide
);

/*
|--------------------------------------------------------------------------
| Driver Arrival
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/arriving",
  rideController
    .markDriverArriving
);

router.patch(
  "/:bookingId/arrived",
  rideController
    .markDriverArrived
);

/*
|--------------------------------------------------------------------------
| Ride Start OTP
|--------------------------------------------------------------------------
*/

router.post(
  "/:bookingId/verify-start-otp",
  rideController
    .verifyRideStartOtp
);

// Customer reconnect/resume recovery. This returns the SAME already-generated
// OTP and never creates a new one.
router.get(
  "/:bookingId/start-otp",
  rideController
    .getCustomerRideStartOtp
);

router.post(
  "/:bookingId/regenerate-start-otp",
  rideController
    .regenerateRideStartOtp
);

/*
|--------------------------------------------------------------------------
| Start And Complete Ride
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/start",
  rideController.startRide
);

router.patch(
  "/:bookingId/complete",
  rideController.completeRide
);

/*
|--------------------------------------------------------------------------
| Driver Live Location
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/location",
  rideController
    .updateDriverLocation
);

/*
|--------------------------------------------------------------------------
| Cancel Ride
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/cancel",
  rideController.cancelRide
);

/*
|--------------------------------------------------------------------------
| Ratings
|--------------------------------------------------------------------------
*/

router.post(
  "/:bookingId/rate-driver",
  rideController.rateDriver
);

router.post(
  "/:bookingId/rate-customer",
  rideController.rateCustomer
);

/*
|--------------------------------------------------------------------------
| Get Ride By ID
|--------------------------------------------------------------------------
| Dynamic route हमेशा सबसे नीचे रहे।
|--------------------------------------------------------------------------
*/

router.get(
  "/:bookingId",
  rideController.getRideById
);

module.exports = router;
