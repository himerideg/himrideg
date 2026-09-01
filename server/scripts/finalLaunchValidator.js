/*
|=============================================================================
| HimRideG Phase 5 — Final Launch Validator (READ-ONLY)
|=============================================================================
| This script never creates/changes rides, payments, drivers or customers.
| It only reads public health/readiness endpoints and validates that the
| production scalability foundation reports the expected ready state.
|
| Usage:
|   API_BASE_URL=https://api.himrideg.com npm run validate:live
|
| Optional:
|   VALIDATE_PUBLIC_WEB=true WEB_BASE_URL=https://www.himrideg.com npm run validate:live
|=============================================================================
*/

const { URL } = require("url");

const API_BASE_URL = String(
  process.env.API_BASE_URL ||
  process.env.HIMRIDEG_API_BASE_URL ||
  "http://127.0.0.1:5001"
).replace(/\/+$/, "");

const WEB_BASE_URL = String(
  process.env.WEB_BASE_URL ||
  "https://www.himrideg.com"
).replace(/\/+$/, "");

const VALIDATE_PUBLIC_WEB =
  String(process.env.VALIDATE_PUBLIC_WEB || "false").toLowerCase() === "true";

const REQUEST_TIMEOUT_MS = Math.max(
  2000,
  Number(process.env.VALIDATOR_TIMEOUT_MS || 12000)
);

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_error) {
    return false;
  }
};

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "HimRideG-Final-Launch-Validator/1.0"
      },
      signal: controller.signal
    });

    const text = await response.text();
    let body = null;

    try {
      body = JSON.parse(text);
    } catch (_error) {
      body = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      body,
      text
    };
  } finally {
    clearTimeout(timer);
  }
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html,*/*",
        "User-Agent": "HimRideG-Final-Launch-Validator/1.0"
      },
      signal: controller.signal
    });

    const text = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      text
    };
  } finally {
    clearTimeout(timer);
  }
};

const nested = (object, path) =>
  path.split(".").reduce((current, key) =>
    current && Object.prototype.hasOwnProperty.call(current, key)
      ? current[key]
      : undefined,
  object);

const checks = [];

const addCheck = (name, pass, detail) => {
  checks.push({
    name,
    pass: Boolean(pass),
    detail
  });
};

const main = async () => {
  if (!isHttpUrl(API_BASE_URL)) {
    throw new Error(`Invalid API_BASE_URL: ${API_BASE_URL}`);
  }

  console.log(`HimRideG final launch validator -> ${API_BASE_URL}`);
  console.log("Mode: READ-ONLY. No ride/payment mutation endpoints are called.\n");

  const health = await fetchJson(`${API_BASE_URL}/api/v2/health`);
  addCheck(
    "API health endpoint",
    health.ok,
    `HTTP ${health.status}`
  );

  const readiness = await fetchJson(`${API_BASE_URL}/api/v2/readiness`);
  addCheck(
    "API readiness endpoint",
    readiness.ok && readiness.body && readiness.body.success === true,
    `HTTP ${readiness.status}`
  );

  const data = readiness.body && readiness.body.data
    ? readiness.body.data
    : {};

  const expectedTrueChecks = [
    ["MongoDB connected", "databaseConnected"],
    ["Real money mode enabled", "realMoneyMode"],
    ["Razorpay payment configured", "razorpayPaymentConfigured"],
    ["Payment webhook configured", "paymentWebhookConfigured"],
    ["Redis enabled", "redis.enabled"],
    ["Redis ready", "redis.ready"],
    ["Socket.IO Redis adapter ready", "redis.socketAdapterReady"],
    ["Live location cache enabled", "liveLocationCache.enabled"],
    ["Live location cache active", "liveLocationCache.active"],
    ["Distributed driver availability enabled", "distributedDriverAvailability.enabled"],
    ["Distributed driver availability active", "distributedDriverAvailability.active"],
    ["Distributed ride accept lock enabled", "distributedRideAcceptLock.enabled"],
    ["Distributed ride accept lock active", "distributedRideAcceptLock.active"],
    ["Redis map cache enabled", "mapCache.enabled"],
    ["Redis map cache active", "mapCache.active"],
    ["Durable payment webhooks enabled", "durableWebhooks.enabled"],
    ["Webhook background queue enabled", "durableWebhooks.backgroundQueueEnabled"],
    ["Background jobs enabled", "backgroundJobs.enabled"],
    ["Distributed background queue ready", "backgroundJobs.distributedQueueReady"],
    ["Background worker running", "backgroundJobs.workerRunning"]
  ];

  for (const [name, path] of expectedTrueChecks) {
    const value = nested(data, path);
    addCheck(name, value === true, `${path}=${String(value)}`);
  }

  // Shared upload storage is required before horizontal multi-instance scaling,
  // but keeping the existing persistent-disk fallback is valid for one instance.
  const uploadShared = nested(data, "uploadStorage.sharedAcrossInstances");
  addCheck(
    "Shared upload storage ready for multi-instance",
    uploadShared === true,
    `uploadStorage.sharedAcrossInstances=${String(uploadShared)}`
  );

  // RazorpayX account number is a configuration warning, not a reason to take
  // customer ride booking offline. Surface it clearly without fabricating data.
  const payoutEnabled = nested(data, "razorpayXPayoutEnabled") === true;
  const payoutAccountConfigured = nested(data, "razorpayXAccountConfigured") === true;
  addCheck(
    "RazorpayX account configured when payouts enabled",
    !payoutEnabled || payoutAccountConfigured,
    `payoutEnabled=${payoutEnabled}, accountConfigured=${payoutAccountConfigured}`
  );

  if (VALIDATE_PUBLIC_WEB) {
    if (!isHttpUrl(WEB_BASE_URL)) {
      addCheck("Public website URL valid", false, `Invalid WEB_BASE_URL: ${WEB_BASE_URL}`);
    } else {
      const web = await fetchText(WEB_BASE_URL);
      const containsBrand = /HimRideG/i.test(web.text || "");
      addCheck(
        "Public website reachable",
        web.ok,
        `HTTP ${web.status}`
      );
      addCheck(
        "Public website serves HimRideG content",
        web.ok && containsBrand,
        `brandDetected=${containsBrand}`
      );
    }
  }

  console.table(checks);

  const failed = checks.filter((item) => !item.pass);
  const passed = checks.length - failed.length;

  console.log(`\nFinal launch checks: ${passed}/${checks.length} PASS`);

  if (failed.length) {
    console.error("\nItems requiring attention:");
    for (const item of failed) {
      console.error(`- ${item.name}: ${item.detail}`);
    }
    process.exitCode = 1;
  } else {
    console.log("\nAll requested final launch readiness checks passed.");
  }
};

main().catch((error) => {
  console.error("Final launch validator failed:", error && error.message ? error.message : error);
  process.exitCode = 1;
});
