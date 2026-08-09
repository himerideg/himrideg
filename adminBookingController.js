const mongoose = require("mongoose");

const Booking = require(
  "../models/Booking"
);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function isAdminRequest(req) {
  return Boolean(
    req.user &&
      req.user.role === "admin"
  );
}

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    String(value || "")
  );
}

/*
|--------------------------------------------------------------------------
| Get Full Booking Details For Admin
|--------------------------------------------------------------------------
|
| Important:
| Password, socket ID, FCM token, login lock data expose nahi hoga.
| Admin ko customer + driver + ride ki saari operational details milengi.
|
|--------------------------------------------------------------------------
*/

async function getAdminBookingDetails(
  req,
  res
) {
  try {
    if (!isAdminRequest(req)) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Sirf admin booking details dekh sakta hai."
        });
    }

    const bookingId =
      String(
        req.params?.bookingId ||
          ""
      ).trim();

    if (
      !validObjectId(
        bookingId
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Valid booking ID required hai."
        });
    }

    const booking =
      await Booking
        .findById(
          bookingId
        )

        /*
        |--------------------------------------------------------------------------
        | Customer Full Safe Details
        |--------------------------------------------------------------------------
        */

        .populate(
          "customer",

          [
            "name",
            "phone",
            "alternativePhone",
            "email",
            "role",
            "profileImage",
            "isPhoneVerified",
            "isEmailVerified",
            "isActive",
            "accountStatus",
            "lastLoginAt",
            "lastSeenAt",
            "createdAt",
            "updatedAt"
          ].join(" ")
        )

        /*
        |--------------------------------------------------------------------------
        | Driver Full Safe Details
        |--------------------------------------------------------------------------
        */

        .populate(
          "driver",

          [
            "name",
            "phone",
            "alternativePhone",
            "email",
            "role",
            "profileImage",
            "isPhoneVerified",
            "isEmailVerified",
            "isActive",
            "accountStatus",

            "warnings",
            "blockReason",
            "blockedAt",
            "unblockRequest",

            "driverProfile",
            "wallet",

            "isOnline",
            "isAvailable",
            "currentRide",
            "currentLocation",

            "lastLoginAt",
            "lastSeenAt",

            "createdAt",
            "updatedAt"
          ].join(" ")
        );

    if (!booking) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Booking nahi mili."
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Booking details fetched successfully",

        booking,

        data: {
          booking
        }
      });
  } catch (error) {
    console.error(
      "Admin booking details error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Booking details load nahi hui."
      });
  }
}

module.exports = {
  getAdminBookingDetails
};