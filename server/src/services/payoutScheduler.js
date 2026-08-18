const walletService = require("./walletService");

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    await walletService.retryUncertainPayouts(10);
    await walletService.reconcilePendingPayouts(25);
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
  console.log(`💸 Payout scheduler: ${Math.round(ms / 1000)}s`);
}

function stopPayoutScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startPayoutScheduler, stopPayoutScheduler };
