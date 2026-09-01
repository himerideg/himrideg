/*
|--------------------------------------------------------------------------
| HimRideG Distributed Map Cache — Phase 4
|--------------------------------------------------------------------------
|
| Geoapify autocomplete/reverse/route responses ko Redis me share karta hai
| taaki multiple backend instances same external request dobara na bhejen.
| Redis unavailable ho to existing mapController local Map() cache untouched
| fallback ke roop me continue karta hai.
|
*/

const scalability = require("../config/scalability");

const {
  isRedisReady,
  getRedisCommandClient
} = require("./redisRuntime");

let redisHitCount = 0;
let redisMissCount = 0;
let redisWriteCount = 0;
let redisErrorCount = 0;
let lastError = "";

function enabled() {
  return Boolean(
    scalability.mapCache?.redisEnabled
  );
}

function active() {
  return Boolean(
    enabled() &&
      isRedisReady() &&
      getRedisCommandClient()
  );
}

function cacheKey(key) {
  return [
    scalability.redis.keyPrefix,
    scalability.mapCache?.namespace || "map",
    String(key || "")
  ].join(":");
}

async function getMapCache(key) {
  if (!active()) {
    return null;
  }

  try {
    const redis =
      getRedisCommandClient();

    const raw = await redis.get(
      cacheKey(key)
    );

    if (!raw) {
      redisMissCount += 1;
      return null;
    }

    const parsed = JSON.parse(raw);
    redisHitCount += 1;
    lastError = "";
    return parsed;
  } catch (error) {
    redisErrorCount += 1;
    lastError = String(
      error?.message || error || "Map Redis cache error"
    );

    console.error(
      "[MapCache] Redis read fallback:",
      lastError
    );

    return null;
  }
}

async function setMapCache(
  key,
  value,
  ttlMs
) {
  if (!active()) {
    return false;
  }

  try {
    const redis =
      getRedisCommandClient();

    const ttlSeconds = Math.max(
      1,
      Math.ceil(Number(ttlMs || 0) / 1000)
    );

    await redis.set(
      cacheKey(key),
      JSON.stringify(value),
      {
        EX: ttlSeconds
      }
    );

    redisWriteCount += 1;
    lastError = "";
    return true;
  } catch (error) {
    redisErrorCount += 1;
    lastError = String(
      error?.message || error || "Map Redis cache error"
    );

    console.error(
      "[MapCache] Redis write fallback:",
      lastError
    );

    return false;
  }
}

function getMapCacheStatus() {
  return {
    enabled: enabled(),
    active: active(),
    namespace:
      scalability.mapCache?.namespace || "map",
    redisHitCount,
    redisMissCount,
    redisWriteCount,
    redisErrorCount,
    lastError: lastError || null
  };
}

module.exports = {
  getMapCache,
  setMapCache,
  getMapCacheStatus
};
