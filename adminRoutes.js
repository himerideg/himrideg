const express =
  require("express");

const {
  protect
} = require(
  "../middlewares/auth"
);

const {
  loginAdmin,
  getAdminProfile,
  getAdminDashboard,
  getDrivers,
  updateDriver,
  getCustomers,
  updateCustomer,
  getDriverDocument,
  verifyDriverDocument,
  updateDriverLegalName  // NEW
} = require(
  "../controllers/adminController"
);

const {
  getAdminBookingDetails
} = require(
  "../controllers/adminBookingController"
);

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Public Admin Login
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginAdmin
);

/*
|--------------------------------------------------------------------------
| Protect Remaining Admin Routes
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Admin Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  getAdminProfile
);

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  getAdminDashboard
);

/*
|--------------------------------------------------------------------------
| Driver Management
|--------------------------------------------------------------------------
*/

router.get(
  "/drivers",
  getDrivers
);

/*
|--------------------------------------------------------------------------
| Full Booking Details
|--------------------------------------------------------------------------
|
| GET /api/v2/admin/bookings/:bookingId
|
|--------------------------------------------------------------------------
*/

router.get(
  "/bookings/:bookingId",
  getAdminBookingDetails
);

/*
|--------------------------------------------------------------------------
| Send Driver Warning
|--------------------------------------------------------------------------
*/

router.patch(
  "/drivers/:id/warning",

  (
    req,
    res,
    next
  ) => {
    req.params.action =
      "warn";

    return updateDriver(
      req,
      res,
      next
    );
  }
);

/*
|--------------------------------------------------------------------------
| Reject Driver Unblock Request
|--------------------------------------------------------------------------
*/

router.patch(
  "/drivers/:id/unblock-request/reject",

  (
    req,
    res,
    next
  ) => {
    req.params.action =
      "reject-unblock-request";

    return updateDriver(
      req,
      res,
      next
    );
  }
);

/*
|--------------------------------------------------------------------------
| Driver Document File — Admin View
|--------------------------------------------------------------------------
| GET /api/v2/admin/drivers/:driverId/documents/:documentId/file
*/

router.get(
  "/drivers/:driverId/documents/:documentId/file",
  getDriverDocument
);

/*
|--------------------------------------------------------------------------
| Driver Document Verify / Reject
|--------------------------------------------------------------------------
| PATCH /api/v2/admin/drivers/:driverId/documents/:documentId/verify
| PATCH /api/v2/admin/drivers/:driverId/documents/:documentId/reject
*/

router.patch(
  "/drivers/:driverId/documents/:documentId/verify",
  (req, res, next) => { req.params.action = "verify"; verifyDriverDocument(req, res, next); }
);

router.patch(
  "/drivers/:driverId/documents/:documentId/reject",
  (req, res, next) => { req.params.action = "reject"; verifyDriverDocument(req, res, next); }
);

/*
|--------------------------------------------------------------------------
| Driver Generic Action
|--------------------------------------------------------------------------
|
| approve
| reject
| block
| unblock
| suspend
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| NEW: Driver Legal Name — Admin Update & Lock
| Must be BEFORE /:id/:action to avoid conflict
|--------------------------------------------------------------------------
| PATCH /api/v2/admin/drivers/:driverId/legal-name
*/

router.patch(
  "/drivers/:driverId/legal-name",
  updateDriverLegalName
);

router.patch(
  "/drivers/:id/:action",
  updateDriver
);

/*
|--------------------------------------------------------------------------
| Customer Management
|--------------------------------------------------------------------------
*/

router.get(
  "/customers",
  getCustomers
);

router.patch(
  "/customers/:id/:action",
  updateCustomer
);

module.exports =
  router;