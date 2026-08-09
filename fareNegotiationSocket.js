/*
|==========================================================================
| FARE NEGOTIATION SOCKET EVENTS
| Yeh code rideSocket.js mein add karna hai
|
| registerSocketConnection ke andar, handleDisconnect ke baad add karo:
|   handleFareNegotiation(io, socket);
|
| Aur SOCKET_EVENTS object mein yeh add karo:
|   FARE_OFFERED: "fare:offered",
|   FARE_COUNTERED: "fare:countered",
|   FARE_ACCEPTED: "fare:accepted",
|   FARE_REJECTED: "fare:rejected",
|   PAYMENT_REQUESTED: "payment:requested",
|==========================================================================
*/

/*
|--------------------------------------------------------------------------
| Fare Negotiation Handler
|--------------------------------------------------------------------------
*/

const handleFareNegotiation = (io, socket) => {

  /*
  |--------------------------------------------------------------------------
  | Driver Fare Offer karta hai
  | Event: "fare:offer"
  | Payload: { bookingId, amount }
  |--------------------------------------------------------------------------
  */
  socket.on("fare:offer", async (payload, callback) => {
    try {
      if (socket.userRole !== "driver") {
        return sendFailure(callback, {
          message: "Sirf driver fare offer kar sakta hai",
          code: "ACCESS_DENIED"
        });
      }

      const { bookingId, amount } = payload || {};

      if (!bookingId || !amount || Number(amount) <= 0) {
        return sendFailure(callback, {
          message: "Booking ID aur valid amount required hai"
        });
      }

      const fare = Number(amount);
      if (fare < 50 || fare > 10000) {
        return sendFailure(callback, {
          message: "Fare ₹50 se ₹10,000 ke beech hona chahiye"
        });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return sendFailure(callback, {
          message: "Booking nahi mili"
        });
      }

      // Check driver ka ye booking hai
      const bookingDriverId =
        booking.driver?._id?.toString() || booking.driver?.toString();

      if (bookingDriverId !== socket.userId) {
        return sendFailure(callback, {
          message: "Ye aapki ride nahi hai"
        });
      }

      if (booking.fareOfferCount >= 6) {
        return sendFailure(callback, {
          message: "Zyada baar offer nahi kar sakte. Final decision karo."
        });
      }

      // Booking update karo
      booking.driverOfferedFare = fare;
      booking.fareStatus = "driver_offered";
      booking.fareOfferedBy = "driver";
      booking.fareOfferCount = (booking.fareOfferCount || 0) + 1;
      booking.fareOfferedAt = new Date();

      // Status update
      if (booking.status === "accepted" || booking.status === "driver_arriving" || booking.status === "driver_arrived") {
        booking.status = "negotiating";
      }

      await booking.save();

      // Customer ko notify karo
      const customerId =
        booking.customer?._id?.toString() || booking.customer?.toString();

      io.to(`user:${customerId}`).emit("fare:offered", {
        bookingId,
        driverOfferedFare: fare,
        fareOfferCount: booking.fareOfferCount,
        message: `Driver ne ₹${fare} ka offer diya hai`,
        timestamp: new Date()
      });

      // Ride room ko bhi emit karo
      io.to(`ride:${bookingId}`).emit("fare:status:updated", {
        bookingId,
        fareStatus: "driver_offered",
        driverOfferedFare: fare,
        fareOfferCount: booking.fareOfferCount
      });

      sendSuccess(callback, "Fare offer bhej diya gaya", {
        driverOfferedFare: fare,
        fareOfferCount: booking.fareOfferCount
      });

    } catch (error) {
      console.error("fare:offer error:", error);
      sendFailure(callback, { message: error.message || "Fare offer nahi ho saka" });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Customer Counter Offer karta hai
  | Event: "fare:counter"
  | Payload: { bookingId, amount }
  |--------------------------------------------------------------------------
  */
  socket.on("fare:counter", async (payload, callback) => {
    try {
      if (socket.userRole !== "customer") {
        return sendFailure(callback, {
          message: "Sirf customer counter offer kar sakta hai"
        });
      }

      const { bookingId, amount } = payload || {};

      if (!bookingId || !amount || Number(amount) <= 0) {
        return sendFailure(callback, {
          message: "Booking ID aur valid amount required hai"
        });
      }

      const fare = Number(amount);
      if (fare < 50 || fare > 10000) {
        return sendFailure(callback, {
          message: "Counter fare ₹50 se ₹10,000 ke beech hona chahiye"
        });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return sendFailure(callback, { message: "Booking nahi mili" });
      }

      const customerId =
        booking.customer?._id?.toString() || booking.customer?.toString();

      if (customerId !== socket.userId) {
        return sendFailure(callback, { message: "Ye aapki ride nahi hai" });
      }

      if (booking.fareOfferCount >= 6) {
        return sendFailure(callback, {
          message: "Negotiation limit khatam. Accept ya reject karo."
        });
      }

      booking.customerCounterFare = fare;
      booking.fareStatus = "customer_countered";
      booking.fareOfferedBy = "customer";
      booking.fareOfferCount = (booking.fareOfferCount || 0) + 1;
      booking.fareOfferedAt = new Date();
      await booking.save();

      // Driver ko notify karo
      const driverId =
        booking.driver?._id?.toString() || booking.driver?.toString();

      io.to(`driver:${driverId}`).emit("fare:countered", {
        bookingId,
        customerCounterFare: fare,
        fareOfferCount: booking.fareOfferCount,
        message: `Customer ne ₹${fare} ka counter offer diya`,
        timestamp: new Date()
      });

      io.to(`ride:${bookingId}`).emit("fare:status:updated", {
        bookingId,
        fareStatus: "customer_countered",
        customerCounterFare: fare,
        fareOfferCount: booking.fareOfferCount
      });

      sendSuccess(callback, "Counter offer bhej diya gaya", {
        customerCounterFare: fare,
        fareOfferCount: booking.fareOfferCount
      });

    } catch (error) {
      console.error("fare:counter error:", error);
      sendFailure(callback, { message: error.message || "Counter offer nahi ho saka" });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Fare Accept karna (customer ya driver dono kar sakte hain)
  | Event: "fare:accept"
  | Payload: { bookingId }
  |--------------------------------------------------------------------------
  */
  socket.on("fare:accept", async (payload, callback) => {
    try {
      const { bookingId } = payload || {};

      if (!bookingId) {
        return sendFailure(callback, { message: "Booking ID required hai" });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return sendFailure(callback, { message: "Booking nahi mili" });
      }

      const role = socket.userRole;
      const userId = socket.userId;

      // Role check
      if (role === "customer") {
        const customerId =
          booking.customer?._id?.toString() || booking.customer?.toString();
        if (customerId !== userId) {
          return sendFailure(callback, { message: "Ye aapki ride nahi hai" });
        }
      } else if (role === "driver") {
        const driverId =
          booking.driver?._id?.toString() || booking.driver?.toString();
        if (driverId !== userId) {
          return sendFailure(callback, { message: "Ye aapki ride nahi hai" });
        }
      } else {
        return sendFailure(callback, { message: "Access denied" });
      }

      // Final fare decide karo
      // Jo last offer tha woh final hoga
      let finalFare;

      if (role === "customer") {
        // Customer accept kar raha hai driver ka offer
        finalFare = booking.driverOfferedFare ||
          booking.customerCounterFare ||
          booking.estimatedFare;
      } else {
        // Driver accept kar raha hai customer ka counter
        finalFare = booking.customerCounterFare ||
          booking.driverOfferedFare ||
          booking.estimatedFare;
      }

      if (!finalFare || finalFare <= 0) {
        return sendFailure(callback, {
          message: "Final fare valid nahi hai"
        });
      }

      booking.finalFare = Number(finalFare);
      booking.fareStatus = "fare_accepted";
      booking.fareAcceptedAt = new Date();
      booking.status = "fare_accepted";

      // Commission calculate
      const commissionPercent = booking.platformCommissionPercent || 10;
      booking.platformCommissionAmount = Math.round((finalFare * commissionPercent) / 100);
      booking.driverPayableAmount = finalFare - booking.platformCommissionAmount;

      await booking.save();

      const customerId =
        booking.customer?._id?.toString() || booking.customer?.toString();
      const driverId =
        booking.driver?._id?.toString() || booking.driver?.toString();

      const fareAcceptedData = {
        bookingId,
        finalFare,
        fareStatus: "fare_accepted",
        message: `Fare ₹${finalFare} pe lock ho gaya! 🎉`,
        driverPayable: booking.driverPayableAmount,
        timestamp: new Date()
      };

      // Dono ko notify karo
      io.to(`user:${customerId}`).emit("fare:accepted", fareAcceptedData);
      io.to(`driver:${driverId}`).emit("fare:accepted", fareAcceptedData);
      io.to(`ride:${bookingId}`).emit("fare:status:updated", fareAcceptedData);

      // Customer ko payment request bhejo
      io.to(`user:${customerId}`).emit("payment:requested", {
        bookingId,
        finalFare,
        message: "Ride complete hone par payment karna hoga",
        paymentMethods: ["online", "cash"]
      });

      sendSuccess(callback, `Fare ₹${finalFare} accept ho gaya`, { finalFare });

    } catch (error) {
      console.error("fare:accept error:", error);
      sendFailure(callback, { message: error.message || "Fare accept nahi ho saka" });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Fare Reject karna
  | Event: "fare:reject"
  | Payload: { bookingId }
  |--------------------------------------------------------------------------
  */
  socket.on("fare:reject", async (payload, callback) => {
    try {
      const { bookingId } = payload || {};

      if (!bookingId) {
        return sendFailure(callback, { message: "Booking ID required hai" });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return sendFailure(callback, { message: "Booking nahi mili" });
      }

      booking.fareStatus = "fare_rejected";
      await booking.save();

      const customerId =
        booking.customer?._id?.toString() || booking.customer?.toString();
      const driverId =
        booking.driver?._id?.toString() || booking.driver?.toString();

      const rejectData = {
        bookingId,
        fareStatus: "fare_rejected",
        message: "Fare reject ho gaya. Phir se negotiate karo ya ride cancel karo.",
        timestamp: new Date()
      };

      io.to(`user:${customerId}`).emit("fare:rejected", rejectData);
      io.to(`driver:${driverId}`).emit("fare:rejected", rejectData);
      io.to(`ride:${bookingId}`).emit("fare:status:updated", rejectData);

      sendSuccess(callback, "Fare reject ho gaya", {});

    } catch (error) {
      console.error("fare:reject error:", error);
      sendFailure(callback, { message: error.message || "Fare reject nahi ho saka" });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Ride Complete hone ke baad payment request
  | Event: "ride:payment:initiate"
  | Payload: { bookingId, paymentMethod: "online" | "cash" }
  |--------------------------------------------------------------------------
  */
  socket.on("ride:payment:initiate", async (payload, callback) => {
    try {
      const { bookingId, paymentMethod } = payload || {};

      if (!bookingId || !paymentMethod) {
        return sendFailure(callback, {
          message: "Booking ID aur payment method required hai"
        });
      }

      if (!["online", "cash"].includes(paymentMethod)) {
        return sendFailure(callback, {
          message: "Payment method online ya cash hona chahiye"
        });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return sendFailure(callback, { message: "Booking nahi mili" });
      }

      if (booking.status !== "completed") {
        return sendFailure(callback, {
          message: "Payment sirf completed ride ke liye"
        });
      }

      if (booking.paymentStatus === "paid") {
        return sendFailure(callback, { message: "Payment already ho chuki hai" });
      }

      const finalFare = Number(
        booking.finalFare ||
        booking.driverOfferedFare ||
        booking.estimatedFare ||
        0
      );

      const driverId =
        booking.driver?._id?.toString() || booking.driver?.toString();

      if (paymentMethod === "cash") {
        // Cash: driver ko notify karo
        io.to(`driver:${driverId}`).emit("payment:cash:collect", {
          bookingId,
          finalFare,
          message: `Customer ₹${finalFare} cash dega`,
          timestamp: new Date()
        });

        sendSuccess(callback, "Driver ko cash collection notify kar diya", {
          paymentMethod: "cash",
          finalFare
        });
      } else {
        // Online: Razorpay ke liye respond karo
        sendSuccess(callback, "Online payment ke liye proceed karo", {
          paymentMethod: "online",
          finalFare,
          message: "Frontend se /api/v2/payments/create-order call karo"
        });
      }

    } catch (error) {
      console.error("ride:payment:initiate error:", error);
      sendFailure(callback, { message: error.message || "Payment initiate nahi ho saka" });
    }
  });

};

// EXPORT: rideSocket.js mein add karna
module.exports = { handleFareNegotiation };

/*
|==========================================================================
| INSTRUCTIONS: rideSocket.js mein kya changes karne hain
|==========================================================================
|
| 1. SOCKET_EVENTS object mein add karo (line ~12 ke paas):
|
|   FARE_OFFERED: "fare:offered",
|   FARE_COUNTERED: "fare:countered",
|   FARE_ACCEPTED: "fare:accepted",
|   FARE_REJECTED: "fare:rejected",
|   PAYMENT_REQUESTED: "payment:requested",
|   PAYMENT_CASH_COLLECT: "payment:cash:collect",
|
| 2. registerSocketConnection function mein, handleDisconnect ke baad:
|
|   handleFareNegotiation(io, socket);
|
| 3. File ke top pe import add karo:
|   const { handleFareNegotiation } = require("./fareNegotiationSocket");
|
|==========================================================================
*/
