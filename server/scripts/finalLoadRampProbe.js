/*
|=============================================================================
| HimRideG Phase 5 — Controlled Read-Only Load Ramp
|=============================================================================
| Safety rules:
| - GET endpoints only.
| - Defaults to localhost.
| - Production/public hosts require ALLOW_PRODUCTION_LOAD_TEST=true.
| - No login, booking, fare, OTP, wallet or payment mutation is generated.
|
| Example local:
|   npm run load:final
|
| Example controlled production window:
|   API_BASE_URL=https://api.himrideg.com \
|   ALLOW_PRODUCTION_LOAD_TEST=true \
|   LOAD_STAGES=25,50,100,200 \
|   npm run load:final
|=============================================================================
*/

const { performance } = require("perf_hooks");
const { URL } = require("url");

const API_BASE_URL = String(
  process.env.API_BASE_URL ||
  process.env.HIMRIDEG_API_BASE_URL ||
  "http://127.0.0.1:5001"
).replace(/\/+$/, "");

const ENDPOINTS = String(
  process.env.LOAD_ENDPOINTS ||
  "/api/v2/health,/api/v2/readiness"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const STAGES = String(process.env.LOAD_STAGES || "10,25,50,100")
  .split(",")
  .map((item) => Number(item.trim()))
  .filter((item) => Number.isInteger(item) && item > 0);

const REQUESTS_PER_WORKER = Math.max(
  1,
  Math.min(50, Number(process.env.LOAD_REQUESTS_PER_WORKER || 2))
);

const PAUSE_BETWEEN_STAGES_MS = Math.max(
  0,
  Number(process.env.LOAD_STAGE_PAUSE_MS || 1500)
);

const TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.LOAD_REQUEST_TIMEOUT_MS || 10000)
);

const ALLOW_PRODUCTION_LOAD_TEST =
  String(process.env.ALLOW_PRODUCTION_LOAD_TEST || "false").toLowerCase() === "true";

const MAX_STAGE = Math.max(...STAGES, 0);

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[index].toFixed(1));
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestOnce = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "HimRideG-Controlled-Load-Probe/1.0"
      },
      signal: controller.signal
    });

    // Consume response so sockets can be reused correctly.
    await response.arrayBuffer();

    return {
      ok: response.ok,
      status: response.status,
      latencyMs: performance.now() - started,
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      latencyMs: performance.now() - started,
      error: error && error.name ? error.name : "request_error"
    };
  } finally {
    clearTimeout(timeout);
  }
};

const runStage = async (concurrency) => {
  const results = [];
  let endpointCursor = 0;

  const worker = async () => {
    for (let index = 0; index < REQUESTS_PER_WORKER; index += 1) {
      const endpoint = ENDPOINTS[endpointCursor % ENDPOINTS.length];
      endpointCursor += 1;
      results.push(await requestOnce(`${API_BASE_URL}${endpoint}`));
    }
  };

  const started = performance.now();
  await Promise.all(Array.from({ length: concurrency }, worker));
  const durationMs = performance.now() - started;

  const latencies = results.map((item) => item.latencyMs);
  const successCount = results.filter((item) => item.ok).length;
  const failureCount = results.length - successCount;
  const successRate = results.length
    ? Number(((successCount / results.length) * 100).toFixed(2))
    : 0;
  const rps = durationMs > 0
    ? Number(((results.length / durationMs) * 1000).toFixed(2))
    : 0;

  return {
    concurrency,
    requests: results.length,
    success: successCount,
    failed: failureCount,
    successRate,
    durationMs: Number(durationMs.toFixed(1)),
    rps,
    p50Ms: percentile(latencies, 50),
    p95Ms: percentile(latencies, 95),
    p99Ms: percentile(latencies, 99),
    maxMs: latencies.length ? Number(Math.max(...latencies).toFixed(1)) : 0
  };
};

const main = async () => {
  if (!ENDPOINTS.length || !STAGES.length) {
    throw new Error("LOAD_ENDPOINTS and LOAD_STAGES must contain valid values.");
  }

  let parsed;
  try {
    parsed = new URL(API_BASE_URL);
  } catch (_error) {
    throw new Error(`Invalid API_BASE_URL: ${API_BASE_URL}`);
  }

  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  const isLocal = localHosts.has(parsed.hostname);

  if (!isLocal && !ALLOW_PRODUCTION_LOAD_TEST) {
    throw new Error(
      "Refusing to load-test a non-local host. Set ALLOW_PRODUCTION_LOAD_TEST=true only during an approved controlled test window."
    );
  }

  if (!isLocal && MAX_STAGE > 1000) {
    throw new Error(
      "Public-host safety cap is 1000 concurrent read-only workers per stage. Scale beyond this with a dedicated load-testing environment/tool."
    );
  }

  console.log(`HimRideG controlled load ramp -> ${API_BASE_URL}`);
  console.log(`Endpoints: ${ENDPOINTS.join(", ")}`);
  console.log(`Stages: ${STAGES.join(" -> ")}`);
  console.log(`Requests per worker: ${REQUESTS_PER_WORKER}`);
  console.log("Mutation endpoints: NONE\n");

  const summaries = [];

  for (let index = 0; index < STAGES.length; index += 1) {
    const concurrency = STAGES[index];
    const summary = await runStage(concurrency);
    summaries.push(summary);
    console.table([summary]);

    if (summary.successRate < 99) {
      console.error(
        `Stage ${concurrency} stopped the ramp because success rate ${summary.successRate}% is below 99%.`
      );
      break;
    }

    if (index < STAGES.length - 1) {
      await sleep(PAUSE_BETWEEN_STAGES_MS);
    }
  }

  const failedStage = summaries.find((item) => item.successRate < 99);
  if (failedStage) {
    process.exitCode = 1;
    return;
  }

  console.log("Controlled read-only load ramp completed without a <99% success stage.");
};

main().catch((error) => {
  console.error("Controlled load ramp failed:", error && error.message ? error.message : error);
  process.exitCode = 1;
});
