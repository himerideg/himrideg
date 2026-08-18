const mongoose = require("mongoose");

const Booking = require("../models/Booking");

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const MAX_FARE_OFFERS = 6;
const MIN_FARE = 1;
const MAX_FARE = 100000;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getUserId(req) {
  return String(
    req.user?._id ||
      req.user?.id ||
      ""
  );
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    value
  );
}

function normalizeFare(value) {
  const fare = Number(value);

  if (
    !Number.isFinite(fare) ||
    fare < MIN_FARE ||
    fare > MAX_FARE
  ) {
    return null;
  }

  return Math.round(fare);
}

function sameId(first, second) {
  if (!first || !second) {
    return false;
  }

  return String(first) === String(second);
}

function isRideFinished(booking) {
  return [
    "completed",
    "cancelled",
    "expired"
  ].includes(booking.status);
}

function calculateCommission(
  finalFare,
  commissionPercent = 10
) {
  const fare = Number(finalFare);
  const percent = Number(
    commissionPercent
  );

  const commissionAmount =
    Math.round(
      fare * percent
    ) / 100;

  const driverPayable =
    Math.round(
      (fare - commissionAmount) *
        100
    ) / 100;

  return {
    commissionAmount,
    driverPayable
  };
}

/*
|--------------------------------------------------------------------------
| Optional Socket Notification
|--------------------------------------------------------------------------
|
| Ye function tab bhi error nahi karega agar Socket.IO app par set nahi hai.
| Baad me socket server ke saath exact rooms connect kar sakte hain.
|
*/

function emitFareUpdate(
  req,
  booking,
  eventName
) {
  try {
    const io =
      req.app?.get("io");

    if (!io) {
      return;
    }

    const payload = {
      bookingId: booking._id,
      bookingNumber:
        booking.bookingNumber,

      status: booking.status,
      fareStatus:
        booking.fareStatus,

      driverOfferedFare:
        booking.driverOfferedFare,

      customerCounterFare:
        booking.customerCounterFare,

      finalFare:
        booking.finalFare,

      fareOfferedBy:
        booking.fareOfferedBy,

      fareOfferCount:
        booking.fareOfferCount,

      platformCommissionPercent:
        booking.platformCommissionPercent,

      platformCommissionAmount:
        booking.platformCommissionAmount,

      driverPayableAmount:
        booking.driverPayableAmount,

      fareOfferedAt:
        booking.fareOfferedAt,

      fareAcceptedAt:
        booking.fareAcceptedAt
    };

    io.to(
      `booking:${booking._id}`
    ).emit(
      eventName,
      payload
    );

    if (booking.customer) {
      io.to(
        `user:${booking.customer}`
      ).emit(
        eventName,
        payload
      );
    }

    if (booking.driver) {
      io.to(
        `user:${booking.driver}`
      ).emit(
        eventName,
        payload
      );
    }
  } catch (error) {
    console.error(
      "Fare socket emit error:",
      error.message
    );
  }
}

/*
|--------------------------------------------------------------------------
| Get Fare Details
|--------------------------------------------------------------------------
| GET /api/v2/fares/:bookingId
|--------------------------------------------------------------------------
*/

exports.getFareDetails = async (
  req,
  res
) => {
  try {
    const {
      bookingId
    } = req.params;

    if (
      !isValidObjectId(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID valid nahi hai"
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      )
        .populate(
          "customer",
          "name phone role"
        )
        .populate(
          "driver",
          "name phone role"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking nahi mili"
      });
    }

    const userId =
      getUserId(req);

    const userRole =
      req.user?.role;

    const allowed =
      userRole === "admin" ||
      sameId(
        booking.customer?._id ||
          booking.customer,
        userId
      ) ||
      sameId(
        booking.driver?._id ||
          booking.driver,
        userId
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "Aap is ride ka fare nahi dekh sakte"
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        bookingId:
          booking._id,

        bookingNumber:
          booking.bookingNumber,

        customer:
          booking.customer,

        driver:
          booking.driver,

        rideStatus:
          booking.status,

        driverOfferedFare:
          booking.driverOfferedFare,

        customerCounterFare:
          booking.customerCounterFare,

        finalFare:
          booking.finalFare,

        fareStatus:
          booking.fareStatus,

        fareOfferedBy:
          booking.fareOfferedBy,

        fareOfferCount:
          booking.fareOfferCount,

        maxFareOffers:
          MAX_FARE_OFFERS,

        offersRemaining:
          Math.max(
            0,
            MAX_FARE_OFFERS -
              Number(
                booking.fareOfferCount ||
                  0
              )
          ),

        platformCommissionPercent:
          booking.platformCommissionPercent,

        platformCommissionAmount:
          booking.platformCommissionAmount,

        driverPayableAmount:
          booking.driverPayableAmount,

        fareOfferedAt:
          booking.fareOfferedAt,

        fareAcceptedAt:
          booking.fareAcceptedAt
      }
    });
  } catch (error) {
    console.error(
      "Get fare details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Fare details nahi mil sakin"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Driver Sends Fare
|--------------------------------------------------------------------------
| POST /api/v2/fares/:bookingId/driver-offer
| Body: { fare: 500 }
|--------------------------------------------------------------------------
*/

exports.driverOfferFare = async (
  req,
  res
) => {
  try {
    const {
      bookingId
    } = req.params;

    const fare =
      normalizeFare(
        req.body?.fare
      );

    if (
      !isValidObjectId(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID valid nahi hai"
      });
    }

    if (fare === null) {
      return res.status(400).json({
        success: false,
        message:
          "Valid fare enter karo"
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking nahi mili"
      });
    }

    const driverId =
      getUserId(req);

    if (
      req.user?.role !==
      "driver"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Sirf driver fare bhej sakta hai"
      });
    }

    if (!booking.driver) {
      return res.status(400).json({
        success: false,
        message:
          "Is ride par driver assign nahi hai"
      });
    }

    if (
      !sameId(
        booking.driver,
        driverId
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Aap is ride ke assigned driver nahi hain"
      });
    }

    if (isRideFinished(booking)) {
      return res.status(400).json({
        success: false,
        message:
          "Finished ride par fare offer nahi bhej sakte"
      });
    }

    if (
      booking.fareStatus ===
      "fare_accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fare pehle hi final ho chuka hai"
      });
    }

    if (
      Number(
        booking.fareOfferCount ||
          0
      ) >= MAX_FARE_OFFERS
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum fare offers limit complete ho gayi"
      });
    }

    booking.driverOfferedFare =
      fare;

    booking.fareOfferedBy =
      "driver";

    booking.fareStatus =
      "driver_offered";

    booking.fareOfferCount =
      Number(
        booking.fareOfferCount ||
          0
      ) + 1;

    booking.fareOfferedAt =
      new Date();

    booking.status =
      "fare_offered";

    await booking.save();

    emitFareUpdate(
      req,
      booking,
      "fare:driver-offered"
    );

    return res.status(200).json({
      success: true,
      message:
        `Driver ne ₹${fare} ka fare offer bheja`,

      data: {
        bookingId:
          booking._id,

        offeredFare:
          booking.driverOfferedFare,

        fareStatus:
          booking.fareStatus,

        fareOfferedBy:
          booking.fareOfferedBy,

        fareOfferCount:
          booking.fareOfferCount,

        offersRemaining:
          Math.max(
            0,
            MAX_FARE_OFFERS -
              booking.fareOfferCount
          )
      }
    });
  } catch (error) {
    console.error(
      "Driver fare offer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Driver fare offer nahi bhej saka"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Customer Sends Counter Offer
|--------------------------------------------------------------------------
| POST /api/v2/fares/:bookingId/customer-counter
| Body: { fare: 450 }
|--------------------------------------------------------------------------
*/

exports.customerCounterFare =
  async (req, res) => {
    try {
      const {
        bookingId
      } = req.params;

      const fare =
        normalizeFare(
          req.body?.fare
        );

      if (
        !isValidObjectId(
          bookingId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Booking ID valid nahi hai"
          });
      }

      if (fare === null) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Valid counter fare enter karo"
          });
      }

      const booking =
        await Booking.findById(
          bookingId
        );

      if (!booking) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Booking nahi mili"
          });
      }

      const customerId =
        getUserId(req);

      if (
        req.user?.role !==
        "customer"
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Sirf customer counter offer bhej sakta hai"
          });
      }

      if (
        !sameId(
          booking.customer,
          customerId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Aap is booking ke customer nahi hain"
          });
      }

      if (isRideFinished(booking)) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Finished ride par counter offer nahi bhej sakte"
          });
      }

      if (
        booking.fareStatus ===
        "fare_accepted"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Fare pehle hi final ho chuka hai"
          });
      }

      if (
        booking.fareStatus !==
          "driver_offered" &&
        booking.fareOfferedBy !==
          "driver"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Driver ke offer ke baad hi counter offer bhej sakte hain"
          });
      }

      if (
        Number(
          booking.fareOfferCount ||
            0
        ) >= MAX_FARE_OFFERS
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Maximum fare offers limit complete ho gayi"
          });
      }

      booking.customerCounterFare =
        fare;

      booking.fareOfferedBy =
        "customer";

      booking.fareStatus =
        "customer_countered";

      booking.fareOfferCount =
        Number(
          booking.fareOfferCount ||
            0
        ) + 1;

      booking.fareOfferedAt =
        new Date();

      booking.status =
        "negotiating";

      await booking.save();

      emitFareUpdate(
        req,
        booking,
        "fare:customer-countered"
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            `Customer ne ₹${fare} ka counter offer bheja`,

          data: {
            bookingId:
              booking._id,

            counterFare:
              booking.customerCounterFare,

            fareStatus:
              booking.fareStatus,

            fareOfferedBy:
              booking.fareOfferedBy,

            fareOfferCount:
              booking.fareOfferCount,

            offersRemaining:
              Math.max(
                0,
                MAX_FARE_OFFERS -
                  booking.fareOfferCount
              )
          }
        });
    } catch (error) {
      console.error(
        "Customer counter fare error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message ||
            "Counter offer nahi bheja ja saka"
        });
    }
  };

/*
|--------------------------------------------------------------------------
| Accept Current Fare
|--------------------------------------------------------------------------
| POST /api/v2/fares/:bookingId/accept
|
| Customer driver ka offer accept karega.
| Driver customer ka counter offer accept karega.
|--------------------------------------------------------------------------
*/

exports.acceptFare = async (
  req,
  res
) => {
  try {
    const {
      bookingId
    } = req.params;

    if (
      !isValidObjectId(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID valid nahi hai"
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking nahi mili"
      });
    }

    if (isRideFinished(booking)) {
      return res.status(400).json({
        success: false,
        message:
          "Finished ride ka fare accept nahi kar sakte"
      });
    }

    if (
      booking.fareStatus ===
      "fare_accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fare pehle hi accept ho chuka hai"
      });
    }

    const userId =
      getUserId(req);

    const role =
      req.user?.role;

    let acceptedFare = null;

    /*
    |--------------------------------------------------------------------------
    | Customer accepts driver's latest offer
    |--------------------------------------------------------------------------
    */

    if (role === "customer") {
      if (
        !sameId(
          booking.customer,
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Aap is booking ke customer nahi hain"
          });
      }

      if (
        booking.fareOfferedBy !==
          "driver" ||
        !booking.driverOfferedFare
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Accept karne ke liye driver ka active offer nahi hai"
          });
      }

      acceptedFare =
        Number(
          booking.driverOfferedFare
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Driver accepts customer's latest counter offer
    |--------------------------------------------------------------------------
    */

    else if (role === "driver") {
      if (
        !sameId(
          booking.driver,
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Aap is ride ke assigned driver nahi hain"
          });
      }

      if (
        booking.fareOfferedBy !==
          "customer" ||
        !booking.customerCounterFare
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Accept karne ke liye customer ka active counter offer nahi hai"
          });
      }

      acceptedFare =
        Number(
          booking.customerCounterFare
        );
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Sirf customer ya driver fare accept kar sakta hai"
      });
    }

    const commissionPercent =
      Number(
        booking
          .platformCommissionPercent ||
          10
      );

    const {
      commissionAmount,
      driverPayable
    } = calculateCommission(
      acceptedFare,
      commissionPercent
    );

    booking.finalFare =
      acceptedFare;

    booking.fare.finalFare =
      acceptedFare;

    booking.fare.platformFee =
      commissionAmount;

    booking.platformCommissionPercent =
      commissionPercent;

    booking.platformCommissionAmount =
      commissionAmount;

    booking.driverPayableAmount =
      driverPayable;

    booking.fareStatus =
      "fare_accepted";

    booking.status =
      "fare_accepted";

    booking.fareAcceptedAt =
      new Date();

    await booking.save();

    emitFareUpdate(
      req,
      booking,
      "fare:accepted"
    );

    return res.status(200).json({
      success: true,
      message:
        `₹${acceptedFare} final fare accept ho gaya`,

      data: {
        bookingId:
          booking._id,

        finalFare:
          booking.finalFare,

        platformCommissionPercent:
          booking.platformCommissionPercent,

        platformCommissionAmount:
          booking.platformCommissionAmount,

        driverPayableAmount:
          booking.driverPayableAmount,

        fareStatus:
          booking.fareStatus,

        rideStatus:
          booking.status,

        fareAcceptedAt:
          booking.fareAcceptedAt
      }
    });
  } catch (error) {
    console.error(
      "Accept fare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Fare accept nahi ho saka"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Reject Current Fare
|--------------------------------------------------------------------------
| POST /api/v2/fares/:bookingId/reject
|--------------------------------------------------------------------------
*/

exports.rejectFare = async (
  req,
  res
) => {
  try {
    const {
      bookingId
    } = req.params;

    if (
      !isValidObjectId(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID valid nahi hai"
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking nahi mili"
      });
    }

    if (isRideFinished(booking)) {
      return res.status(400).json({
        success: false,
        message:
          "Finished ride ka fare reject nahi kar sakte"
      });
    }

    if (
      booking.fareStatus ===
      "fare_accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Accepted fare reject nahi kiya ja sakta"
      });
    }

    const userId =
      getUserId(req);

    const role =
      req.user?.role;

    if (role === "customer") {
      if (
        !sameId(
          booking.customer,
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Aap is booking ke customer nahi hain"
          });
      }

      if (
        booking.fareOfferedBy !==
        "driver"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Driver ka active offer nahi hai"
          });
      }
    } else if (role === "driver") {
      if (
        !sameId(
          booking.driver,
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Aap is ride ke assigned driver nahi hain"
          });
      }

      if (
        booking.fareOfferedBy !==
        "customer"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Customer ka active counter offer nahi hai"
          });
      }
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Sirf customer ya driver fare reject kar sakta hai"
      });
    }

    booking.fareStatus =
      "fare_rejected";

    /*
    |--------------------------------------------------------------------------
    | Ride cancel nahi kar rahe.
    | Driver/customer dobara offer bhej sakta hai jab tak limit available hai.
    |--------------------------------------------------------------------------
    */

    booking.status =
      "negotiating";

    await booking.save();

    emitFareUpdate(
      req,
      booking,
      "fare:rejected"
    );

    return res.status(200).json({
      success: true,
      message:
        "Fare offer reject ho gaya",

      data: {
        bookingId:
          booking._id,

        fareStatus:
          booking.fareStatus,

        rideStatus:
          booking.status,

        fareOfferCount:
          booking.fareOfferCount,

        offersRemaining:
          Math.max(
            0,
            MAX_FARE_OFFERS -
              Number(
                booking.fareOfferCount ||
                  0
              )
          )
      }
    });
  } catch (error) {
    console.error(
      "Reject fare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Fare reject nahi ho saka"
    });
  }
};