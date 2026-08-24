const mongoose = require("mongoose");

const Booking = require("../models/Booking");

const rideService = require("../services/rideService");
const { sendPushToUser } = require("../services/pushNotificationService");

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const MAX_FARE_OFFERS = 3;
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

    const bookingId =
      String(
        booking?._id ||
          ""
      );

    const customerId =
      String(
        booking?.customer?._id ||
          booking?.customer ||
          ""
      );

    const driverId =
      String(
        booking?.driver?._id ||
          booking?.driver ||
          ""
      );

    const payload = {
      bookingId:
        booking._id,

      bookingNumber:
        booking.bookingNumber,

      status:
        booking.status,

      rideStatus:
        booking.status,

      fareStatus:
        booking.fareStatus,

      driverOfferedFare:
        booking.driverOfferedFare,

      customerCounterFare:
        booking.customerCounterFare,

      driverFinalFareProposal:
        booking.driverFinalFareProposal,

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

    /*
    |--------------------------------------------------------------------------
    | Canonical Cross-Client Event Alias
    |--------------------------------------------------------------------------
    |
    | REST controller ke purane event names:
    |   fare:driver-offered      -> fare:offered
    |   fare:customer-countered  -> fare:countered
    |
    | Mobile aur website dono canonical names sunte hain. Compatibility ke
    | liye original event bhi emit hota rahega, lekin canonical alias bhi har
    | connected client ko milega.
    |
    */

    const canonicalEvent =
      eventName ===
      "fare:driver-offered"
        ? "fare:offered"
        : eventName ===
          "fare:customer-countered"
          ? "fare:countered"
          : eventName;

    const eventNames =
      Array.from(
        new Set(
          [
            eventName,
            canonicalEvent,
            "fare:status:updated",
            "ride:updated"
          ].filter(Boolean)
        )
      );

    const rooms =
      Array.from(
        new Set(
          [
            bookingId
              ? `ride:${bookingId}`
              : "",
            /*
            | Legacy room preserve kiya hai in case kisi old client ne ise join
            | kiya ho. Canonical ride room upar primary hai.
            */
            bookingId
              ? `booking:${bookingId}`
              : "",
            customerId
              ? `user:${customerId}`
              : "",
            customerId
              ? `customer:${customerId}`
              : "",
            driverId
              ? `user:${driverId}`
              : "",
            driverId
              ? `driver:${driverId}`
              : ""
          ].filter(Boolean)
        )
      );

    if (io) {
      rooms.forEach(
        (room) => {
          eventNames.forEach(
            (name) => {
              io.to(
                room
              ).emit(
                name,
                payload
              );
            }
          );
        }
      );
    }

    /*
    |--------------------------------------------------------------------
    | Native Fare Notifications
    |--------------------------------------------------------------------
    | Socket foreground sync ke saath installed HimRideG build ko tray
    | notification bhi mile. Failure fare transaction ko kabhi rollback
    | nahi karta.
    |--------------------------------------------------------------------
    */

    let pushTarget = "";
    let pushTitle = "";
    let pushBody = "";
    let pushSoundEvent = "system_update";

    if (eventName === "fare:driver-offered") {
      pushTarget = customerId;
      pushTitle = "Driver Fare Offer";
      pushBody = `Driver ne ₹${Number(booking.driverOfferedFare || 0)} fare bheja. Accept, Reject ya Counter karein.`;
      pushSoundEvent = "fare_initial";
    } else if (eventName === "fare:customer-countered") {
      pushTarget = driverId;
      pushTitle = "Customer Counter Offer";
      pushBody = `Customer ne ₹${Number(booking.customerCounterFare || 0)} counter bheja. Ab apna FINAL fare bhejein.`;
      pushSoundEvent = "fare_counter";
    } else if (eventName === "fare:final-offered") {
      pushTarget = customerId;
      pushTitle = "Driver FINAL Fare";
      pushBody = `Driver ne ₹${Number(booking.driverFinalFareProposal || 0)} final fare bheja. Accept ya Reject karein.`;
      pushSoundEvent = "fare_final";
    } else if (eventName === "fare:accepted") {
      pushTarget = driverId;
      pushTitle = "Fare Locked ✅";
      pushBody = `₹${Number(booking.finalFare || 0)} fare accept ho gaya. GO TO PICKUP enabled hai.`;
      pushSoundEvent = "fare_locked";
    } else if (eventName === "fare:final-rejected") {
      pushTarget = driverId;
      pushTitle = "Fare Rejected";
      pushBody = "Customer ne fare reject kiya. Ride current driver se release ho rahi hai.";
      pushSoundEvent = "ride_cancelled";
    }

    if (pushTarget && pushTitle) {
      sendPushToUser(
        pushTarget,
        {
          title: pushTitle,
          body: pushBody,
          data: {
            type: "fare_update",
            soundEvent: pushSoundEvent,
            eventName,
            bookingId,
            role: pushTarget === customerId ? "customer" : "driver",
            fareStatus: booking.fareStatus,
            rideStatus: booking.status,
            driverOfferedFare: Number(booking.driverOfferedFare || 0),
            customerCounterFare: Number(booking.customerCounterFare || 0),
            driverFinalFareProposal: Number(booking.driverFinalFareProposal || 0),
            finalFare: Number(booking.finalFare || 0)
          }
        }
      ).catch((error) => {
        console.error(
          "Fare push error:",
          error.message
        );
      });
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

    /*
    |--------------------------------------------------------------------------
    | Exact one-time initial driver fare
    |--------------------------------------------------------------------------
    | Driver initial -> Customer one counter -> Driver FINAL -> Customer
    | Accept/Reject. Initial fare ko update/repeat karke loop nahi banana.
    |--------------------------------------------------------------------------
    */

    if (
      String(
        booking.fareStatus ||
          "not_offered"
      ) !== "not_offered" ||
      Number(
        booking.fareOfferCount ||
          0
      ) !== 0 ||
      Number(
        booking.driverOfferedFare ||
          0
      ) > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Initial driver fare pehle hi bheja ja chuka hai. Ab customer ke Accept / Reject / one-time Counter ka wait karo."
      });
    }

    if (
      ![
        "accepted",
        "driver_assigned"
      ].includes(
        booking.status
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Initial fare sirf ride accept hone ke turant baad bhej sakte ho"
      });
    }

    booking.driverOfferedFare =
      fare;

    booking.fareOfferedBy =
      "driver";

    booking.fareStatus =
      "driver_offered";

    booking.fareOfferCount =
      1;

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
          "driver_offered" ||
        booking.fareOfferedBy !==
          "driver" ||
        !Number(
          booking.driverOfferedFare
        )
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Driver ke initial fare ke baad hi one-time counter bhej sakte hain"
          });
      }

      if (
        Number(
          booking.customerCounterFare ||
            0
        ) > 0 ||
        Number(
          booking.fareOfferCount ||
            0
        ) !== 1
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Customer ka one-time counter already use ho chuka hai"
          });
      }

      booking.customerCounterFare =
        fare;

      booking.fareOfferedBy =
        "customer";

      booking.fareStatus =
        "customer_countered";

      booking.fareOfferCount =
        2;

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

    /*
    |--------------------------------------------------------------------------
    | Legacy /accept compatibility gate
    |--------------------------------------------------------------------------
    | Final production rule me customer driver ke INITIAL fare ko bhi direct
    | Accept kar sakta hai. Agar customer Counter karta hai to driver ka next
    | offer FINAL hota hai. Driver customer counter ko direct accept nahi karega.
    | Purane /accept clients ko canonical customer acceptance endpoint par
    | route karke app + website + older clients compatible rakhe ja rahe hain.
    |--------------------------------------------------------------------------
    */

    if (
      role === "customer" &&
      sameId(
        booking.customer,
        userId
      ) &&
      [
        "driver_offered",
        "driver_final"
      ].includes(booking.fareStatus)
    ) {
      return exports
        .customerAcceptFinalFare(
          req,
          res
        );
    }

    if (
      role === "driver"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Driver customer counter accept nahi karega. Customer counter ke baad driver FINAL fare bhejega."
      });
    }

    return res.status(409).json({
      success: false,
      message:
        "Customer sirf active driver fare ko accept kar sakta hai."
    });

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
| Launch V3 — Driver Sends FINAL Fare
|--------------------------------------------------------------------------
|
| Exact final flow:
| 1. Driver initial fare
| 2. Customer counter
| 3. Driver final fare
| 4. Customer Accept / Reject
| 5. Customer Accept par hi fare lock
|
*/
exports.driverFinalFare = async (
  req,
  res
) => {
  try {
    const {
      bookingId
    } = req.params;

    const fare =
      normalizeFare(
        req.body?.fare ??
          req.body?.amount
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
            "Valid final fare enter karo"
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

    if (
      req.user?.role !==
      "driver"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Sirf driver final fare bhej sakta hai"
        });
    }

    if (
      !sameId(
        booking.driver,
        getUserId(req)
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

    if (isRideFinished(booking)) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "Finished ride par final fare nahi bhej sakte"
        });
    }

    if (
      booking.fareStatus ===
      "fare_accepted"
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "Fare already locked hai"
        });
    }

    const persistedCustomerCounter =
      Number(
        booking.customerCounterFare ||
          0
      );

    const normalFinalFareStage =
      booking.fareStatus ===
        "customer_countered" &&
      booking.fareOfferedBy ===
        "customer" &&
      persistedCustomerCounter > 0;

    /*
    |----------------------------------------------------------------------
    | V26 Final Fare Sync Recovery
    |----------------------------------------------------------------------
    | Legacy/stale data me fareStatus `driver_final` ho sakta hai jabki
    | driverFinalFareProposal 0/null ho. Sirf isi corrupt state me assigned
    | driver ko customer ke already-persisted one-time counter ke against
    | FINAL fare resend karne dete hain. Valid final fare ko overwrite karna
    | allowed nahi hai.
    |----------------------------------------------------------------------
    */

    const recoverableFinalFareStage =
      booking.fareStatus ===
        "driver_final" &&
      Number(
        booking.driverFinalFareProposal ||
          0
      ) <= 0 &&
      persistedCustomerCounter > 0;

    if (
      !normalFinalFareStage &&
      !recoverableFinalFareStage
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "Customer counter fare ke baad hi driver final fare bhejega"
        });
    }

    if (recoverableFinalFareStage) {
      console.warn(
        "Recovering missing driver final fare:",
        String(booking._id)
      );
    }

    booking.driverFinalFareProposal =
      fare;

    booking.driverFinalFareProposedAt =
      new Date();

    booking.fareStatus =
      "driver_final";

    booking.fareOfferedBy =
      "driver";

    booking.fareOfferCount =
      3;

    booking.fareOfferedAt =
      new Date();

    booking.status =
      "negotiating";

    await booking.save();

    emitFareUpdate(
      req,
      booking,
      "fare:final-offered"
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          `Driver final fare ₹${fare} customer ko bhej diya`,

        data: {
          bookingId:
            booking._id,

          driverFinalFareProposal:
            booking.driverFinalFareProposal,

          customerCounterFare:
            booking.customerCounterFare,

          fareStatus:
            booking.fareStatus,

          rideStatus:
            booking.status
        }
      });
  } catch (error) {
    console.error(
      "Driver final fare error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Final fare send nahi hua"
      });
  }
};

/*
|--------------------------------------------------------------------------
| Launch V3 — Customer Accepts Driver FINAL Fare
|--------------------------------------------------------------------------
|
| Sirf is endpoint par fare lock hota hai.
|
*/
exports.customerAcceptFinalFare =
  async (req, res) => {
    try {
      const {
        bookingId
      } = req.params;

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

      if (
        req.user?.role !==
        "customer"
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Sirf customer final fare accept kar sakta hai"
          });
      }

      if (
        !sameId(
          booking.customer,
          getUserId(req)
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
        booking.fareStatus ===
        "fare_accepted"
      ) {
        return res
          .status(200)
          .json({
            success: true,
            message:
              "Fare already locked hai",
            data: {
              bookingId:
                booking._id,
              finalFare:
                booking.finalFare,
              fareStatus:
                booking.fareStatus,
              rideStatus:
                booking.status,
              paymentPlan:
                booking.paymentPlan || null,
              paymentTiming:
                booking.paymentTiming,
              paymentStatus:
                booking.paymentStatus,
              paymentScheduledAt:
                booking.paymentScheduledAt || null
            }
          });
      }

      const acceptingInitialFare =
        booking.fareStatus ===
          "driver_offered" &&
        Number(
          booking.driverOfferedFare
        ) > 0;

      const acceptingFinalFare =
        booking.fareStatus ===
          "driver_final" &&
        Number(
          booking.driverFinalFareProposal
        ) > 0;

      if (
        !acceptingInitialFare &&
        !acceptingFinalFare
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Customer ke liye active driver fare available nahi hai"
          });
      }

      const acceptedFare =
        Number(
          acceptingFinalFare
            ? booking.driverFinalFareProposal
            : booking.driverOfferedFare
        );

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

      booking.finalFareRejectedAt =
        null;

      /*
      |--------------------------------------------------------------------------
      | Legacy Pay Now = Advance Payment
      |--------------------------------------------------------------------------
      | Nayi booking fare lock ke baad popup se paymentPlan choose karti hai.
      | Purani pay_now booking ko safe compatibility ke liye Advance treat karte
      | hain, isliye pickup se pehle payment paid hona required rahega.
      */

      if (
        booking.paymentTiming ===
        "pay_now"
      ) {
        if (!booking.paymentPlan) {
          booking.paymentPlan =
            "advance";
          booking.paymentPlanSelectedAt =
            booking.fareAcceptedAt;
        }
        booking.paymentMethod =
          "online";

        booking.payment.method =
          "online";

        booking.paymentStatus =
          "pending";

        booking.payment.status =
          "pending";
      }

      await booking.save();

      emitFareUpdate(
        req,
        booking,
        "fare:accepted"
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            `₹${acceptedFare} final fare customer ne accept kiya — fare locked`,

          data: {
            bookingId:
              booking._id,

            finalFare:
              booking.finalFare,

            fareStatus:
              booking.fareStatus,

            rideStatus:
              booking.status,

            paymentPlan:
              booking.paymentPlan || null,

            paymentTiming:
              booking.paymentTiming,

            paymentStatus:
              booking.paymentStatus,

            paymentScheduledAt:
              booking.paymentScheduledAt || null,

            paymentRequiredNow:
              booking.paymentTiming ===
                "pay_now" ||
              booking.paymentPlan ===
                "advance",

            platformCommissionAmount:
              booking.platformCommissionAmount,

            driverPayableAmount:
              booking.driverPayableAmount
          }
        });
    } catch (error) {
      console.error(
        "Customer final fare accept error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.message ||
            "Final fare accept nahi hua"
        });
    }
  };

/*
|--------------------------------------------------------------------------
| Launch V3 — Customer Rejects Driver FINAL Fare
|--------------------------------------------------------------------------
|
| Final means final: reject hone par current driver release hota hai aur
| booking next driver ke liye re-dispatch hoti hai.
|
*/
exports.customerRejectFinalFare =
  async (req, res) => {
    try {
      const {
        bookingId
      } = req.params;

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

      if (
        req.user?.role !==
          "customer" ||
        !sameId(
          booking.customer,
          getUserId(req)
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Sirf booking customer final fare reject kar sakta hai"
          });
      }

      if (
        ![
          "driver_offered",
          "driver_final"
        ].includes(
          booking.fareStatus
        )
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Reject karne ke liye active driver fare pending nahi hai"
          });
      }

      const assignedDriver =
        booking.driver;

      booking.fareStatus =
        "fare_rejected";

      booking.finalFareRejectedAt =
        new Date();

      await booking.save();

      emitFareUpdate(
        req,
        booking,
        "fare:final-rejected"
      );

      let releaseResult =
        null;

      if (assignedDriver) {
        releaseResult =
          await rideService
            .driverReleaseRide({
              bookingId:
                booking._id,

              driverId:
                assignedDriver,

              reason:
                "Customer rejected final fare"
            });
      }

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Final fare reject hua. Naya driver search ho raha hai.",

          data: {
            booking:
              releaseResult
                ?.booking ||
              booking,

            dispatch:
              releaseResult
                ?.dispatch ||
              null
          }
        });
    } catch (error) {
      console.error(
        "Customer final fare reject error:",
        error
      );

      return res
        .status(
          error.statusCode ||
            500
        )
        .json({
          success: false,
          message:
            error.message ||
            "Final fare reject nahi hua"
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

    /*
    |--------------------------------------------------------------------------
    | Legacy /reject compatibility gate
    |--------------------------------------------------------------------------
    | New flow me reject sirf customer driver FINAL fare par karega. Reject
    | hone par same driver ko naya offer chance nahi; ride re-dispatch hogi.
    |--------------------------------------------------------------------------
    */

    if (
      role === "customer" &&
      sameId(
        booking.customer,
        userId
      ) &&
      [
        "driver_offered",
        "driver_final"
      ].includes(booking.fareStatus)
    ) {
      return exports
        .customerRejectFinalFare(
          req,
          res
        );
    }

    if (
      role === "driver"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Driver customer counter reject nahi karega. Driver ko FINAL fare bhejna hai."
      });
    }

    return res.status(409).json({
      success: false,
      message:
        "Reject option sirf active driver fare par customer ke liye available hai."
    });

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