const express = require("express");

const bookingController = require(
  "../controllers/bookingController"
);

const { protect } = require(
  "../middlewares/auth"
);

const router = express.Router();

// Is file ke sabhi routes login ke baad hi chalenge
router.use(protect);

// Nayi booking create karna
router.post(
  "/",
  bookingController.createBooking
);

// Customer ki saari bookings
router.get(
  "/my",
  bookingController.getMyBookings
);

// Ek booking ki details
router.get(
  "/:bookingId",
  bookingController.getBookingDetails
);

// Booking cancel karna
router.patch(
  "/:bookingId/cancel",
  bookingController.cancelBooking
);

module.exports = router;