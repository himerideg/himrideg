/*
|--------------------------------------------------------------------------
| HimRideG Phase 4 HTTP Scenario Load Probe
|--------------------------------------------------------------------------
|
| Safe by default: GET-only endpoints. No booking/payment/driver mutation is
| generated. Configure BASE_URL, TOTAL_REQUESTS and CONCURRENCY to scale the
| probe. Optional SCENARIO_PATHS is a comma-separated list of safe GET paths.
|
| Example:
| BASE_URL=https://api.himrideg.com TOTAL_REQUESTS=1000 CONCURRENCY=50 \
| npm run load:scenario
|
*/

const { performance } = require("node:perf_hooks");

const baseUrl = String(
  process.env.BASE_URL ||
    process.env.HIMRIDEG_API_URL ||
    "http://127.0.0.1:5001"
).replace(/\/$/, "");

const totalRequests = Math.max(
  1,
  Math.min(
    Number(process.env.TOTAL_REQUESTS) || 200,
    50000
  )
);

const concurrency = Math.max(
  1,
  Math.min(
    Number(process.env.CONCURRENCY) || 20,
    500
  )
);

const timeoutMs = Math.max(
  1000,
  Math.min(
    Number(process.env.REQUEST_TIMEOUT_MS) || 10000,
    60000
  )
);

const scenarioPaths = String(
  process.env.SCENARIO_PATHS ||
    "/api/v2/health,/api/v2/readiness"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .filter((value) => value.startsWith("/"));

if (!scenarioPaths.length) {
  throw new Error("At least one safe GET SCENARIO_PATHS entry is required");
}

const latencies = [];
let completed = 0;
let succeeded = 0;
let failed = 0;
let nextIndex = 0;

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)
  );
  return sorted[index];
}

async function oneRequest(index) {
  const path = scenarioPaths[index % scenarioPaths.length];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();

  const started = performance.now();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "HimRideG-Scale-Probe/4.0"
      }
    });

    await response.arrayBuffer();

    if (response.ok) {
      succeeded += 1;
    } else {
      failed += 1;
    }
  } catch (error) {
    failed += 1;
  } finally {
    clearTimeout(timeout);
    latencies.push(performance.now() - started);
    completed += 1;
  }
}

async function worker() {
  while (true) {
    const index = nextIndex;
    nextIndex += 1;

    if (index >= totalRequests) {
      return;
    }

    await oneRequest(index);
  }
}

async function main() {
  console.log("HimRideG Phase 4 safe HTTP load probe");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Requests: ${totalRequests}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log(`Paths: ${scenarioPaths.join(", ")}`);

  const started = performance.now();

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, totalRequests) },
      () => worker()
    )
  );

  const elapsedMs = performance.now() - started;
  const rps = completed / Math.max(0.001, elapsedMs / 1000);

  const report = {
    completed,
    succeeded,
    failed,
    successRatePercent: Number(
      ((succeeded / Math.max(1, completed)) * 100).toFixed(2)
    ),
    requestsPerSecond: Number(rps.toFixed(2)),
    latencyMs: {
      p50: Number(percentile(latencies, 50).toFixed(1)),
      p95: Number(percentile(latencies, 95).toFixed(1)),
      p99: Number(percentile(latencies, 99).toFixed(1)),
      max: Number(Math.max(...latencies, 0).toFixed(1))
    }
  };

  console.log(JSON.stringify(report, null, 2));

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
