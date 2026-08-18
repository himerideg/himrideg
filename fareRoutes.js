const express = require("express");

const {
  protect,
  allowRoles
} = require("../middlewares/auth");

const {
  getFareDetails,
  driverOfferFare,
  customerCounterFare,
  acceptFare,
  rejectFare
} = require("../controllers/fareController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Sabhi Fare Routes Protected
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Fare Details
|--------------------------------------------------------------------------
| Customer, driver aur admin dekh sakte hain
*/

router.get(
  "/:bookingId",
  allowRoles(
    "customer",
    "driver",
    "admin"
  ),
  getFareDetails
);

/*
|--------------------------------------------------------------------------
| Driver Fare Offer
|--------------------------------------------------------------------------
*/

router.post(
  "/:bookingId/driver-offer",
  allowRoles("driver"),
  driverOfferFare
);

/*
|--------------------------------------------------------------------------
| Customer Counter Offer
|--------------------------------------------------------------------------
*/

router.post(
  "/:bookingId/customer-counter",
  allowRoles("customer"),
  customerCounterFare
);

/*
|--------------------------------------------------------------------------
| Fare Accept
|--------------------------------------------------------------------------
| Customer driver offer accept karega
| Driver customer counter accept karega
*/

router.post(
  "/:bookingId/accept",
  allowRoles(
    "customer",
    "driver"
  ),
  acceptFare
);

/*
|--------------------------------------------------------------------------
| Fare Reject
|--------------------------------------------------------------------------
*/

router.post(
  "/:bookingId/reject",
  allowRoles(
    "customer",
    "driver"
  ),
  rejectFare
);

module.exports = router;