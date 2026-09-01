#!/usr/bin/env node
/*
|--------------------------------------------------------------------------
| HimRideG Safe Read-Only Load Probe — Phase 3
|--------------------------------------------------------------------------
|
| Default behavior sirf GET readiness endpoint hit karta hai. Koi booking,
| payment, driver state ya production data mutate nahi hota.
|
| Examples:
|   node scripts/scalabilityLoadProbe.js
|   LOAD_PROBE_TOTAL=1000 LOAD_PROBE_CONCURRENCY=50 node scripts/scalabilityLoadProbe.js
|   LOAD_PROBE_BASE_URL=https://api.himrideg.com node scripts/scalabilityLoadProbe.js
|
| High production load deliberately cap kiya gaya hai. 5k/10k real stress
| run dedicated staging/approved window me hi karna chahiye.
|--------------------------------------------------------------------------
*/

const { performance } = require("perf_hooks");

function positiveInteger(
  value,
  fallback,
  maximum
) {
  const parsed =
    Math.floor(Number(value));

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return Math.min(
    parsed,
    maximum
  );
}

const baseUrl = String(
  process.env.LOAD_PROBE_BASE_URL ||
    "http://127.0.0.1:5001"
).replace(/\/$/, "");

const path = String(
  process.env.LOAD_PROBE_PATH ||
    "/api/v2/readiness"
);

const total = positiveInteger(
  process.env.LOAD_PROBE_TOTAL,
  200,
  10000
);

const concurrency = positiveInteger(
  process.env.LOAD_PROBE_CONCURRENCY,
  20,
  500
);

const timeoutMs = positiveInteger(
  process.env.LOAD_PROBE_TIMEOUT_MS,
  10000,
  60000
);

const target =
  `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

const latencies = [];
let success = 0;
let failed = 0;
let cursor = 0;

async function oneRequest() {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    );

  const started =
    performance.now();

  try {
    const response =
      await fetch(target, {
        method: "GET",
        signal:
          controller.signal,
        headers: {
          "User-Agent":
            "HimRideG-Scalability-Load-Probe/1.0",
          "X-HimRideG-Client":
            "scalability-load-probe"
        }
      });

    const elapsed =
      performance.now() -
      started;

    latencies.push(elapsed);

    if (response.ok) {
      success += 1;
    } else {
      failed += 1;
    }

    await response.arrayBuffer();
  } catch (error) {
    failed += 1;

    latencies.push(
      performance.now() -
        started
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function worker() {
  while (true) {
    const index = cursor;
    cursor += 1;

    if (index >= total) {
      return;
    }

    await oneRequest();
  }
}

function percentile(
  values,
  percentage
) {
  if (!values.length) {
    return 0;
  }

  const sorted = [
    ...values
  ].sort((a, b) => a - b);

  const position =
    Math.min(
      sorted.length - 1,
      Math.max(
        0,
        Math.ceil(
          (percentage / 100) *
            sorted.length
        ) - 1
      )
    );

  return sorted[position];
}

async function main() {
  console.log(
    `[LoadProbe] target=${target} total=${total} concurrency=${concurrency}`
  );

  const started =
    performance.now();

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            concurrency,
            total
          )
      },
      () => worker()
    )
  );

  const elapsedSeconds =
    Math.max(
      0.001,
      (performance.now() -
        started) /
        1000
    );

  const result = {
    target,
    total,
    concurrency,
    success,
    failed,
    successRatePercent:
      Number(
        (
          (success / total) *
          100
        ).toFixed(2)
      ),
    durationSeconds:
      Number(
        elapsedSeconds.toFixed(2)
      ),
    requestsPerSecond:
      Number(
        (
          total /
          elapsedSeconds
        ).toFixed(2)
      ),
    latencyMs: {
      p50:
        Number(
          percentile(
            latencies,
            50
          ).toFixed(1)
        ),
      p95:
        Number(
          percentile(
            latencies,
            95
          ).toFixed(1)
        ),
      p99:
        Number(
          percentile(
            latencies,
            99
          ).toFixed(1)
        ),
      max:
        Number(
          Math.max(
            0,
            ...latencies
          ).toFixed(1)
        )
    }
  };

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  if (failed > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(
    "[LoadProbe] fatal error:",
    error?.message || error
  );

  process.exitCode = 1;
});
