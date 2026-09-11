const Booking = require("../models/Booking");
const User = require("../models/User");
const BookingReferenceArchive = require("../models/BookingReferenceArchive");
const {
  findOrphanBookings
} = require("./bookingReferencePreservationService");

const TERMINAL_STATUSES = new Set([
  "completed",
  "cancelled",
  "expired"
]);

/*
|--------------------------------------------------------------------------
| Active Orphan Ride Repair — SAFE / NON-DESTRUCTIVE
|--------------------------------------------------------------------------
| Only rides that satisfy ALL of these conditions are repaired:
| - customer/driver reference is missing from live User collection
| - ride is still non-terminal
| - payment is NOT paid/refunded
|
| No booking is deleted. Historical snapshot is already preserved in
| BookingReferenceArchive. Paid rides are deliberately skipped for manual
| financial review so no refund/payout can ever be triggered by this repair.
|--------------------------------------------------------------------------
*/

async function releaseSurvivingDriver(bookingId, driverId) {
  if (!driverId) return false;

  const driver = await User.findOne({
    _id: driverId,
    role: "driver"
  }).select("_id isOnline currentRide");

  if (!driver) return false;

  if (String(driver.currentRide || "") !== String(bookingId)) {
    return false;
  }

  await User.updateOne(
    { _id: driver._id, role: "driver", currentRide: bookingId },
    {
      $set: {
        currentRide: null,
        isAvailable: Boolean(driver.isOnline),
        lastSeenAt: new Date()
      }
    }
  );

  return true;
}

async function repairActiveUnpaidOrphanRides() {
  const rows = await findOrphanBookings();
  const now = new Date();

  let eligible = 0;
  let repaired = 0;
  let skippedPaid = 0;
  let releasedDrivers = 0;
  const byOriginalStatus = {};

  for (const row of rows) {
    const status = String(row.status || "");
    const paymentStatus = String(row.paymentStatus || "pending").toLowerCase();

    if (TERMINAL_STATUSES.has(status)) continue;

    if (["paid", "refunded"].includes(paymentStatus)) {
      skippedPaid += 1;
      continue;
    }

    eligible += 1;
    byOriginalStatus[status || "unknown"] =
      Number(byOriginalStatus[status || "unknown"] || 0) + 1;

    const updated = await Booking.findOneAndUpdate(
      {
        _id: row._id,
        status: { $nin: Array.from(TERMINAL_STATUSES) },
        paymentStatus: { $nin: ["paid", "refunded"] }
      },
      {
        $set: {
          status: "cancelled",
          "cancellation.cancelledBy": "system",
          "cancellation.reason":
            "Integrity repair: linked customer/driver account is no longer available.",
          "cancellation.cancelledAt": now,
          expiresAt: now
        }
      },
      { new: true }
    );

    if (!updated) continue;

    repaired += 1;

    if (!row.__driverMissing && row.driver) {
      const released = await releaseSurvivingDriver(
        row._id,
        row.driver
      );
      if (released) releasedDrivers += 1;
    }

    await BookingReferenceArchive.updateOne(
      { booking: row._id },
      {
        $set: {
          rideStatus: "cancelled",
          paymentStatus,
          preservedAt: now
        }
      }
    );
  }

  const summary = {
    mode: "safe-unpaid-only",
    eligible,
    repaired,
    skippedPaid,
    releasedDrivers,
    byOriginalStatus
  };

  console.log(
    `🛠️ ACTIVE_ORPHAN_REPAIR ${JSON.stringify(summary)}`
  );

  return summary;
}

module.exports = {
  repairActiveUnpaidOrphanRides
};
