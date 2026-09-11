const Booking = require("../models/Booking");
const User = require("../models/User");
const BookingReferenceArchive = require("../models/BookingReferenceArchive");

const TERMINAL_STATUSES = new Set([
  "completed",
  "cancelled",
  "expired"
]);

async function findOrphanBookings() {
  return Booking.aggregate([
    {
      $lookup: {
        from: User.collection.name,
        localField: "customer",
        foreignField: "_id",
        as: "__customer"
      }
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: "driver",
        foreignField: "_id",
        as: "__driver"
      }
    },
    {
      $addFields: {
        __customerMissing: {
          $and: [
            { $ne: ["$customer", null] },
            { $eq: [{ $size: "$__customer" }, 0] }
          ]
        },
        __driverMissing: {
          $and: [
            { $ne: ["$driver", null] },
            { $eq: [{ $size: "$__driver" }, 0] }
          ]
        }
      }
    },
    {
      $match: {
        $or: [
          { __customerMissing: true },
          { __driverMissing: true }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        bookingNumber: 1,
        customer: 1,
        driver: 1,
        status: 1,
        paymentStatus: 1,
        paymentMethod: 1,
        finalFare: 1,
        "fare.finalFare": 1,
        travelDate: 1,
        completedAt: 1,
        createdAt: 1,
        __customerMissing: 1,
        __driverMissing: 1
      }
    }
  ]);
}

async function preserveOrphanBookingReferences() {
  const rows = await findOrphanBookings();

  let createdOrUpdated = 0;
  let activeOrphans = 0;
  let historicalOrphans = 0;

  for (const booking of rows) {
    const status = String(booking.status || "");
    if (TERMINAL_STATUSES.has(status)) historicalOrphans += 1;
    else activeOrphans += 1;

    await BookingReferenceArchive.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          booking: booking._id,
          bookingNumber: booking.bookingNumber || "",
          originalCustomer: booking.customer || null,
          originalDriver: booking.driver || null,
          customerReferenceMissing: Boolean(booking.__customerMissing),
          driverReferenceMissing: Boolean(booking.__driverMissing),
          rideStatus: status,
          paymentStatus: String(booking.paymentStatus || ""),
          paymentMethod: String(booking.paymentMethod || ""),
          finalFare:
            booking.finalFare ??
            booking.fare?.finalFare ??
            null,
          travelDate: booking.travelDate || null,
          completedAt: booking.completedAt || null,
          bookingCreatedAt: booking.createdAt || null,
          preservationVersion: 1,
          preservedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    createdOrUpdated += 1;
  }

  const summary = {
    mode: "non-destructive",
    scannedOrphanBookings: rows.length,
    preserved: createdOrUpdated,
    historicalOrphans,
    activeOrphans
  };

  console.log(
    `🧾 BOOKING_REFERENCE_PRESERVATION ${JSON.stringify(summary)}`
  );

  return summary;
}

module.exports = {
  findOrphanBookings,
  preserveOrphanBookingReferences
};
