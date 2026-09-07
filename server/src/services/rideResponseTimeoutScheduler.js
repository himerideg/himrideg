const rideService = require("./rideService");

/*
|--------------------------------------------------------------------------
| HimRideG V62 — Ride Response Timeout Scheduler
|--------------------------------------------------------------------------
| Pre-confirmation negotiation me har current response stage ko 10 minutes.
| Mongo atomic claim multi-instance deployment me duplicate cancellation ko
| prevent karta hai. This scheduler only triggers the authoritative sweep.
|--------------------------------------------------------------------------
*/

const DEFAULT_SWEEP_MS = 15 * 1000;

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;

  try {
    const result = await rideService.sweepNoResponseRides();

    if (result?.cancelled > 0) {
      console.log(
        `[RideResponseTimeout] auto-cancelled ${result.cancelled}/${result.scanned} timed-out ride(s)`
      );
    }
  } catch (error) {
    console.error(
      "[RideResponseTimeout] sweep failed:",
      error?.message || error
    );
  } finally {
    running = false;
  }
}

function startRideResponseTimeoutScheduler() {
  if (timer) return;

  tick().catch(() => {});

  timer = setInterval(tick, DEFAULT_SWEEP_MS);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  console.log(
    "⏱️ Ride response timeout: 10 min auto-cancel/release enabled"
  );
}

function stopRideResponseTimeoutScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  running = false;
}

module.exports = {
  startRideResponseTimeoutScheduler,
  stopRideResponseTimeoutScheduler,
  tick
};
