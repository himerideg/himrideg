/*
|--------------------------------------------------------------------------
| HimRideG V91 — Independent Driver Release (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| Problem (owner report):
|   Ride complete hone ke baad driver tab tak busy rehta tha jab tak customer
|   payment ka koi action na le. Customer app band kar de / payment screen
|   chhod de to driver ko agli booking nahi aati thi.
|
| Rule ab:
|   1. Driver aur customer ek dusre par depend nahi karte.
|   2. Driver khud "Cash mila" ya "Payment nahi mila / baad me" bolkar
|      release ho sakta hai — customer ke action ki zaroorat nahi.
|   3. Safety net: completed + unpaid ride X minute (default 10) ke baad
|      driver ko automatic release kar deti hai.
|   4. Customer ki booking phir bhi completed + payment pending rehti hai.
|      Customer baad me online pay kare to wallet settlement normal hota hai
|      (walletService.settleRidePayment idempotent hai aur sirf usi
|      currentRide wale driver ko touch karta hai, isliye nayi ride safe hai).
|--------------------------------------------------------------------------
*/

const Booking = require("../models/Booking");
const User = require("../models/User");

let syncDriverAvailabilityById = null;
try {
  ({ syncDriverAvailabilityById } = require("./distributedDriverAvailabilityService"));
} catch (error) {
  syncDriverAvailabilityById = null;
}

let socketEvents = null;
try {
  socketEvents = require("./socketEventService");
} catch (error) {
  socketEvents = null;
}

let sendPushToUser = null;
try {
  ({ sendPushToUser } = require("./pushNotificationService"));
} catch (error) {
  sendPushToUser = null;
}

const DEFAULT_AUTO_RELEASE_MINUTES = 10;
const SWEEP_MS = 60 * 1000;

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

function autoReleaseMinutes() {
  const raw = Number(process.env.DRIVER_UNPAID_AUTO_RELEASE_MINUTES);
  if (Number.isFinite(raw) && raw >= 1 && raw <= 180) return raw;
  return DEFAULT_AUTO_RELEASE_MINUTES;
}

class DriverReleaseError extends Error {
  constructor(message, statusCode = 400, code = "DRIVER_RELEASE_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

/*
| Driver availability free karo. Online driver available ho jata hai,
| offline driver ka sirf currentRide clear hota hai.
*/
async function freeDriverSeat(driverId, bookingId) {
  if (!driverId) return false;

  const onlineResult = await User.updateOne(
    { _id: driverId, role: "driver", currentRide: bookingId, isOnline: true },
    { $set: { currentRide: null, isAvailable: true, lastSeenAt: new Date() } }
  );

  const offlineResult = await User.updateOne(
    { _id: driverId, role: "driver", currentRide: bookingId, isOnline: { $ne: true } },
    { $set: { currentRide: null, isAvailable: false, lastSeenAt: new Date() } }
  );

  const changed =
    Number(onlineResult?.modifiedCount || 0) +
    Number(offlineResult?.modifiedCount || 0);

  if (syncDriverAvailabilityById) {
    syncDriverAvailabilityById(driverId).catch((error) => {
      console.error("[DriverIndependentRelease availability sync]", error?.message || error);
    });
  }

  return changed > 0;
}

function notifyRelease(booking, actor) {
  const driverId = idOf(booking.driver);
  const customerId = idOf(booking.customer);
  const payload = {
    bookingId: String(booking._id),
    status: "completed",
    paymentStatus: booking.paymentStatus || "pending",
    driverReleased: true,
    driverReleasedUnpaidAt:
      booking.paymentStatus === "paid" ? null : new Date().toISOString(),
    releasedBy: actor,
    message:
      actor === "auto"
        ? "Driver auto-release ho gaya. Customer payment baad me bhi kar sakta hai."
        : "Driver ne ride close kar di. Aap payment baad me bhi kar sakte hain."
  };

  try {
    socketEvents?.emitDriverEvent?.(driverId, "ride:driver-free", payload);
    socketEvents?.emitCustomerEvent?.(customerId, "ride:driver-closed", payload);
  } catch (error) {
    console.error("[DriverIndependentRelease socket]", error?.message || error);
  }

  if (sendPushToUser && driverId) {
    sendPushToUser(driverId, {
      title: "Aap next ride ke liye free hain ✅",
      body:
        actor === "auto"
          ? "Pichli ride ka payment pending hai, par aapko next ride milti rahegi."
          : "Ride close ho gayi. Ab nayi bookings aayengi.",
      data: { type: "driver_released", bookingId: String(booking._id), role: "driver" }
    }).catch(() => {});
  }

  if (sendPushToUser && customerId && booking.paymentStatus !== "paid") {
    sendPushToUser(customerId, {
      title: "Ride payment pending",
      body: "Aapki ride complete hai. Payment app me 'My Rides' se kabhi bhi kar sakte hain.",
      data: { type: "payment_due", bookingId: String(booking._id), role: "customer" }
    }).catch(() => {});
  }
}

/*
| Completed + unpaid ride se driver ko release karo (payment pending rehta hai).
| actor: "driver" | "auto" | "admin"
*/
async function releaseDriverFromUnpaidRide({ bookingId, actor = "driver", actorId = "", reason = "" }) {
  if (!bookingId) {
    throw new DriverReleaseError("Booking ID required hai", 400, "BOOKING_ID_REQUIRED");
  }

  const booking = await Booking.findById(bookingId).select(
    "_id status paymentStatus driver customer driverReleasedUnpaidAt completedAt"
  );

  if (!booking) {
    throw new DriverReleaseError("Booking nahi mili", 404, "BOOKING_NOT_FOUND");
  }

  if (actor === "driver" && idOf(booking.driver) !== String(actorId)) {
    throw new DriverReleaseError(
      "Sirf assigned driver is ride ko close kar sakta hai",
      403,
      "NOT_ASSIGNED_DRIVER"
    );
  }

  if (String(booking.status || "").toLowerCase() !== "completed") {
    throw new DriverReleaseError(
      "Ride complete hone ke baad hi close kar sakte ho",
      409,
      "RIDE_NOT_COMPLETED"
    );
  }

  const driverId = booking.driver?._id || booking.driver;

  // Already paid → seat free karna hi kaafi hai (idempotent).
  if (String(booking.paymentStatus || "").toLowerCase() === "paid") {
    await freeDriverSeat(driverId, booking._id);
    return { booking, alreadyPaid: true, released: true };
  }

  if (!booking.driverReleasedUnpaidAt) {
    await Booking.updateOne(
      { _id: booking._id, driverReleasedUnpaidAt: null, paymentStatus: { $ne: "paid" } },
      {
        $set: {
          driverReleasedUnpaidAt: new Date(),
          driverReleaseUnpaidReason: String(reason || "").slice(0, 200),
          driverReleaseUnpaidBy: actor
        }
      }
    );
  }

  const released = await freeDriverSeat(driverId, booking._id);
  notifyRelease(booking, actor);

  return { booking, alreadyPaid: false, released: true, seatChanged: released };
}

/*
| Safety sweep: completed + unpaid + not released + older than N minutes.
*/
async function sweepStuckUnpaidDrivers() {
  const minutes = autoReleaseMinutes();
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  const candidates = await Booking.find({
    status: "completed",
    paymentStatus: { $ne: "paid" },
    driverReleasedUnpaidAt: null,
    driver: { $ne: null },
    $or: [
      { completedAt: { $lte: cutoff } },
      { completedAt: null, updatedAt: { $lte: cutoff } }
    ]
  })
    .select("_id driver")
    .limit(100);

  let released = 0;

  for (const candidate of candidates) {
    try {
      // Sirf tab release karo jab driver abhi bhi isi ride par atka ho.
      const stuck = await User.exists({
        _id: candidate.driver,
        role: "driver",
        currentRide: candidate._id
      });

      if (!stuck) {
        await Booking.updateOne(
          { _id: candidate._id, driverReleasedUnpaidAt: null },
          { $set: { driverReleasedUnpaidAt: new Date(), driverReleaseUnpaidBy: "auto", driverReleaseUnpaidReason: "driver already free" } }
        );
        continue;
      }

      await releaseDriverFromUnpaidRide({
        bookingId: candidate._id,
        actor: "auto",
        reason: `auto release after ${minutes} min`
      });
      released += 1;
    } catch (error) {
      console.error("[DriverIndependentRelease sweep item]", error?.message || error);
    }
  }

  return { scanned: candidates.length, released };
}

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const result = await sweepStuckUnpaidDrivers();
    if (result.released > 0) {
      console.log(`[DriverIndependentRelease] auto-released ${result.released}/${result.scanned} driver(s)`);
    }
  } catch (error) {
    console.error("[DriverIndependentRelease] sweep failed:", error?.message || error);
  } finally {
    running = false;
  }
}

function startDriverIndependentReleaseScheduler() {
  if (timer) return;
  tick().catch(() => {});
  timer = setInterval(tick, SWEEP_MS);
  if (typeof timer.unref === "function") timer.unref();
  console.log(`🚕 Driver independent release: unpaid ride auto-release after ${autoReleaseMinutes()} min`);
}

function stopDriverIndependentReleaseScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  running = false;
}

module.exports = {
  DriverReleaseError,
  freeDriverSeat,
  releaseDriverFromUnpaidRide,
  sweepStuckUnpaidDrivers,
  startDriverIndependentReleaseScheduler,
  stopDriverIndependentReleaseScheduler,
  autoReleaseMinutes
};
