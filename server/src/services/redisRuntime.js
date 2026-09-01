/*
|--------------------------------------------------------------------------
| HimRideG Optional Redis Runtime — Phase 2
|--------------------------------------------------------------------------
|
| SAFE / ADD-ONLY infrastructure.
|
| - Redis disabled/unavailable ho to existing single-server behavior chalta
|   rahega.
| - REDIS_REQUIRED=true hone par hi Redis startup failure fatal banega.
| - Redis ready ho to command cache, background queue aur Socket.IO adapter
|   ke clients centralize hote hain.
|
| NOTE: redis aur @socket.io/redis-adapter runtime dependencies package.json
| me add kiye gaye hain. Dynamic require isliye hai taaki Redis disabled mode
| me accidental package/config problem current website ko crash na kare.
|
*/

const scalability = require("../config/scalability");

let commandClient = null;
let pubClient = null;
let subClient = null;
let queueClient = null;

let redisReady = false;
let socketAdapterReady = false;
let runtimeMode = "disabled";
let lastError = "";

function normalizeError(error) {
  return String(
    error?.message ||
      error ||
      "Unknown Redis error"
  );
}

function attachClientErrorLogger(
  client,
  label
) {
  if (!client?.on) {
    return;
  }

  client.on("error", (error) => {
    lastError = normalizeError(error);

    console.error(
      `[Redis:${label}]`,
      lastError
    );
  });
}

async function closeClient(
  client,
  label
) {
  if (!client) {
    return;
  }

  try {
    if (client.isOpen) {
      await client.quit();
    }
  } catch (error) {
    console.error(
      `[Redis:${label}] close error:`,
      normalizeError(error)
    );

    try {
      client.disconnect?.();
    } catch (disconnectError) {
      console.error(
        `[Redis:${label}] disconnect error:`,
        normalizeError(disconnectError)
      );
    }
  }
}

function getRedisStatus() {
  return {
    enabled:
      scalability.redis.enabled,

    required:
      scalability.redis.required,

    ready:
      redisReady,

    socketAdapterEnabled:
      scalability.redis.socketAdapterEnabled,

    socketAdapterReady,

    mode:
      runtimeMode,

    keyPrefix:
      scalability.redis.keyPrefix,

    lastError:
      lastError || null
  };
}

function isRedisReady() {
  return Boolean(
    redisReady &&
      commandClient?.isOpen
  );
}

function getRedisCommandClient() {
  return isRedisReady()
    ? commandClient
    : null;
}

function getRedisQueueClient() {
  return Boolean(
    redisReady &&
      queueClient?.isOpen
  )
    ? queueClient
    : null;
}

async function startRedisRuntime({
  io = null
} = {}) {
  if (!scalability.redis.enabled) {
    runtimeMode = "disabled";

    console.log(
      "ℹ️ Redis scalability runtime disabled — existing single-server mode active"
    );

    return getRedisStatus();
  }

  if (!scalability.redis.url) {
    const error = new Error(
      "REDIS_ENABLED=true hai lekin REDIS_URL missing hai"
    );

    lastError = error.message;
    runtimeMode = "fallback";

    if (scalability.redis.required) {
      throw error;
    }

    console.warn(
      `⚠️ ${error.message}. Existing single-server fallback active.`
    );

    return getRedisStatus();
  }

  try {
    let createClient;

    try {
      ({
        createClient
      } = require("redis"));
    } catch (moduleError) {
      const error = new Error(
        "Redis package load nahi hua. Server dependencies install/update karo."
      );

      error.cause = moduleError;
      throw error;
    }

    commandClient = createClient({
      url:
        scalability.redis.url,

      socket: {
        connectTimeout:
          scalability.redis.connectTimeoutMs,

        reconnectStrategy(retries) {
          const cappedRetries =
            Math.min(
              Number(retries) || 0,
              10
            );

          return Math.min(
            250 * (cappedRetries + 1),
            3000
          );
        }
      }
    });

    pubClient =
      commandClient.duplicate();

    subClient =
      commandClient.duplicate();

    queueClient =
      commandClient.duplicate();

    attachClientErrorLogger(
      commandClient,
      "command"
    );

    attachClientErrorLogger(
      pubClient,
      "pub"
    );

    attachClientErrorLogger(
      subClient,
      "sub"
    );

    attachClientErrorLogger(
      queueClient,
      "queue"
    );

    await Promise.all([
      commandClient.connect(),
      pubClient.connect(),
      subClient.connect(),
      queueClient.connect()
    ]);

    redisReady = true;
    runtimeMode = "redis";
    lastError = "";

    if (
      io &&
      scalability.redis
        .socketAdapterEnabled
    ) {
      try {
        const {
          createAdapter
        } = require(
          "@socket.io/redis-adapter"
        );

        io.adapter(
          createAdapter(
            pubClient,
            subClient,
            {
              key:
                `${scalability.redis.keyPrefix}:socket.io`
            }
          )
        );

        socketAdapterReady = true;

        console.log(
          "✅ Socket.IO Redis adapter active — multi-instance broadcasts ready"
        );
      } catch (adapterError) {
        socketAdapterReady = false;
        lastError =
          normalizeError(
            adapterError
          );

        console.error(
          "⚠️ Socket.IO Redis adapter activate nahi hua:",
          lastError
        );

        if (
          scalability.redis.required
        ) {
          throw adapterError;
        }
      }
    }

    console.log(
      "✅ Redis runtime connected — cache/queue foundation ready"
    );

    return getRedisStatus();
  } catch (error) {
    lastError = normalizeError(error);
    redisReady = false;
    socketAdapterReady = false;
    runtimeMode = "fallback";

    await stopRedisRuntime();

    // stopRedisRuntime normal shutdown ke liye mode "stopped" set karta hai.
    // Startup failure me user-facing status ko explicit fallback rakhna hai.
    runtimeMode = "fallback";

    if (scalability.redis.required) {
      throw error;
    }

    console.error(
      "⚠️ Redis unavailable. Existing single-server fallback active:",
      lastError
    );

    return getRedisStatus();
  }
}

async function stopRedisRuntime() {
  redisReady = false;
  socketAdapterReady = false;

  const clients = [
    [queueClient, "queue"],
    [subClient, "sub"],
    [pubClient, "pub"],
    [commandClient, "command"]
  ];

  queueClient = null;
  subClient = null;
  pubClient = null;
  commandClient = null;

  for (const [client, label] of clients) {
    await closeClient(
      client,
      label
    );
  }

  if (
    scalability.redis.enabled
  ) {
    runtimeMode = "stopped";

    console.log(
      "✅ Redis runtime stopped"
    );
  }
}

module.exports = {
  startRedisRuntime,
  stopRedisRuntime,
  isRedisReady,
  getRedisStatus,
  getRedisCommandClient,
  getRedisQueueClient
};
