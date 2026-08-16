const express = require("express");

const rideController = require(
  "../controllers/rideController"
);

const driverRideFeedController =
  require(
    "../controllers/driverRideFeedController"
  );

const {
  protect,
} = require("../middlewares/auth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Protect All Ride Routes
|--------------------------------------------------------------------------
*/

router.use(protect);

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
|--------------------------------------------------------------------------
*/

router.get(
  "/driver/feed",
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
|--------------------------------------------------------------------------
*/

router.patch(
  "/:bookingId/accept",
  driverRideFeedController
    .acceptAvailableRide
);

router.post(
  "/:bookingId/accept",
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
| Driver Release Accepted / Unconfirmed Ride
|--------------------------------------------------------------------------
|
| Customer response na de ya final fare lock na ho to booking cancel nahi
| hoti. Driver release hota hai aur booking dobara dispatch hoti hai.
|
*/

router.patch(
  "/:bookingId/driver-release",
  driverRideFeedController
    .releaseAcceptedRide
);

router.post(
  "/:bookingId/driver-release",
  driverRideFeedController
    .releaseAcceptedRide
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