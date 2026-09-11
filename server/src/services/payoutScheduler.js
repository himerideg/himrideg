const walletService = require("./walletService");
const {
  processPrimaryRideAutoPayouts
} = require("./primaryRideAutoPayoutService");

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    await walletService.retryUncertainPayouts(10);
    await walletService.reconcilePendingPayouts(25);

    // V73 ADD-ONLY: new completed online rides can send their exact wallet
    // credit to the driver's selected Primary payout account. Old rides are
    // protected by a boot watermark inside the processor, so no retroactive
    // mass payout can happen after deploy/restart.
    await processPrimaryRideAutoPayouts(10);

    // Backward compatibility: existing scheduled daily/weekly/monthly payout
    // behavior remains untouched for drivers who use the legacy setting.
    await walletService.processScheduledPayouts(20);
  } catch (error) {
    console.error("[Payout Scheduler]", error.message);
  } finally {
    running = false;
  }
}

function startPayoutScheduler() {
  if (timer) return;
  const ms = Math.max(60_000, Number(process.env.PAYOUT_SCHEDULER_INTERVAL_MS) || 300_000);
  // Server boot ko external payout API par block nahi karte.
  setTimeout(tick, 10_000).unref();
  timer = setInterval(tick, ms);
  timer.unref();
  console.log(
    `💸 Payout scheduler: ${Math.round(ms / 1000)}s | Primary ride auto payout: ${String(process.env.AUTO_PRIMARY_PAYOUT_ENABLED || "false").toLowerCase() === "true" ? "enabled" : "disabled"}`
  );
}

function stopPayoutScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startPayoutScheduler, stopPayoutScheduler };
