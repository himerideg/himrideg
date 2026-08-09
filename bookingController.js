const Booking = require("../models/Booking");
const bookingService = require("../services/bookingService");
const {
  validateCreateBooking,
  validateBookingId
} = require("../validators/bookingValidator");
const ApiError = require("../utils/ApiError");

/*
|--------------------------------------------------------------------------
| Create New Booking
|--------------------------------------------------------------------------
| Sirf logged-in customer booking create kar sakta hai.
*/
async function createBooking(req, res, next) {
  try {
    if (!req.user?._id) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    if (req.user.role !== "customer") {
      throw new ApiError(
        403,
        "Only customers can create bookings"
      );
    }

    const validatedData =
      validateCreateBooking(req.body);

    const booking =
      await bookingService.createBooking({
        ...validatedData,
        customer: req.user._id,
        status: "searching_driver"
      });

    const populatedBooking =
      await bookingService.getBookingById(
        booking._id
      );

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully. Searching for a driver.",
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Logged-in Customer Bookings
|--------------------------------------------------------------------------
*/
async function getMyBookings(req, res, next) {
  try {
    if (!req.user?._id) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    const bookings =
      await bookingService.getCustomerBookings(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Single Booking
|--------------------------------------------------------------------------
| Customer apni booking dekh sakta hai.
| Assigned driver apni assigned booking dekh sakta hai.
| Admin kisi bhi booking ko dekh sakta hai.
*/
async function getBookingDetails(
  req,
  res,
  next
) {
  try {
    if (!req.user?._id) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    const bookingId = validateBookingId(
      req.params.bookingId
    );

    const booking =
      await bookingService.getBookingById(
        bookingId
      );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found"
      );
    }

    const loggedInUserId =
      req.user._id.toString();

    const customerId =
      booking.customer?._id?.toString() ||
      booking.customer?.toString();

    const driverId =
      booking.driver?._id?.toString() ||
      booking.driver?.toString();

    const isCustomerOwner =
      customerId === loggedInUserId;

    const isAssignedDriver =
      driverId === loggedInUserId;

    const isAdmin =
      req.user.role === "admin";

    if (
      !isCustomerOwner &&
      !isAssignedDriver &&
      !isAdmin
    ) {
      throw new ApiError(
        403,
        "You are not allowed to view this booking"
      );
    }

    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Cancel Customer Booking
|--------------------------------------------------------------------------
| Abhi sirf ride start hone se pehle cancellation allowed hai.
*/
async function cancelBooking(req, res, next) {
  try {
    if (!req.user?._id) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    if (req.user.role !== "customer") {
      throw new ApiError(
        403,
        "Only customers can cancel their bookings from this route"
      );
    }

    const bookingId = validateBookingId(
      req.params.bookingId
    );

    const booking = await Booking.findById(
      bookingId
    );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found"
      );
    }

    if (
      booking.customer.toString() !==
      req.user._id.toString()
    ) {
      throw new ApiError(
        403,
        "You cannot cancel another customer's booking"
      );
    }

    const nonCancellableStatuses = [
      "started",
      "completed",
      "cancelled"
    ];

    if (
      nonCancellableStatuses.includes(
        booking.status
      )
    ) {
      throw new ApiError(
        400,
        `Booking cannot be cancelled when status is ${booking.status}`
      );
    }

    const reason = String(
      req.body?.reason || ""
    ).trim();

    if (!reason) {
      throw new ApiError(
        400,
        "Cancellation reason is required"
      );
    }

    if (reason.length > 500) {
      throw new ApiError(
        400,
        "Cancellation reason cannot exceed 500 characters"
      );
    }

    booking.status = "cancelled";

    booking.cancellation = {
      cancelledBy: "customer",
      reason,
      cancelledAt: new Date()
    };

    await booking.save();

    const updatedBooking =
      await bookingService.getBookingById(
        booking._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking
};