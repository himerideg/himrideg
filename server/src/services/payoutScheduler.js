const walletService = require("./walletService");
const razorpayX = require("./razorpayXService");
const {
  processPrimaryRideAutoPayouts
} = require("./primaryRideAutoPayoutService");
const {
  migrateAllPayoutMethods
} = require("./payoutDataProtectionService");

let timer = null;
let running = false;
let migrationChecked = false;
let accessProbeChecked = false;

async function runOptionalSecurityMigration() {
  if (migrationChecked) return;
  migrationChecked = true;

  const shouldRun =
    String(process.env.PAYOUT_DATA_MIGRATE_ON_START || "false")
      .trim()
      .toLowerCase() === "true";

  if (!shouldRun) return;

  try {
    await migrateAllPayoutMethods({ scrubLegacy: true });
  } catch (error) {
    console.error(
      "[Payout Encryption Migration]",
      error?.message || error
    );
  }
}

/*
|--------------------------------------------------------------------------
| Optional READ-ONLY RazorpayX Access Probe
|--------------------------------------------------------------------------
| Provider approval/credential readiness ko boot par safely verify karta hai.
| Koi payout/contact/fund account create nahi hota. Secrets log nahi hote.
|--------------------------------------------------------------------------
*/
async function runOptionalRazorpayXAccessProbe() {
  if (accessProbeChecked) return;
  accessProbeChecked = true;

  const shouldRun =
    String(process.env.RAZORPAYX_ACCESS_PROBE_ON_START || "false")
      .trim()
      .toLowerCase() === "true";

  if (!shouldRun) return;

  const config = razorpayX.getProbeConfigurationStatus();

  if (!config.ready) {
    console.log(
      `🧪 RAZORPAYX_ACCESS_PROBE ${JSON.stringify({
        ok: false,
        liveKey: config.liveKey,
        missing: config.missing
      })}`
    );
    return;
  }

  try {
    const result = await razorpayX.checkLiveAccess();
    console.log(
      `🧪 RAZORPAYX_ACCESS_PROBE ${JSON.stringify({
        ok: true,
        liveKey: Boolean(result?.liveKey),
        statusCode: result?.statusCode || 200,
        entity: result?.entity || "collection"
      })}`
    );
  } catch (error) {
    console.log(
      `🧪 RAZORPAYX_ACCESS_PROBE ${JSON.stringify({
        ok: false,
        statusCode: error?.statusCode || 0,
        code: error?.code || "RAZORPAYX_ACCESS_PROBE_FAILED",
        message: String(error?.message || "RazorpayX access probe failed").slice(0, 300)
      })}`
    );
  }
}

async function tick() {
  if (running) return;
  running = true;
  try {
    await runOptionalSecurityMigration();
    await runOptionalRazorpayXAccessProbe();

    await walletService.retryUncertainPayouts(10);
    await walletService.reconcilePendingPayouts(25);

    // V73 ADD-ONLY: new completed online rides can send their exact wallet
    // credit to the driver's selected Primary payout account. Old rides are
    // protected by a boot watermark inside the processor, so no retroactive
    // mass payout can happen after deploy/restart.
    await processPrimaryRideAutoPayouts(10);

    // Backward compatibility: existing scheduled daily/weekly/monthly payout
    // behavior remains untouched for drivers who still use the legacy setting.
    await walletService.processScheduledPayouts(20);
  } catch (error) {
    console.error("[Payout Scheduler]", error.message);
  } finally {
    running = false;
  }
}

function startPayoutScheduler() {
  if (timer) return;
  const ms = Math.max(
    60_000,
    Number(process.env.PAYOUT_SCHEDULER_INTERVAL_MS) || 300_000
  );

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

module.exports = {
  startPayoutScheduler,
  stopPayoutScheduler
};
