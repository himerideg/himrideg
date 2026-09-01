require("dotenv").config();

const Booking = require(
  "../src/models/Booking"
);

const User = require(
  "../src/models/User"
);

const scalability = require(
  "../src/config/scalability"
);

/*
|--------------------------------------------------------------------------
| HimRideG Scalability Preflight — SAFE / READ-ONLY
|--------------------------------------------------------------------------
|
| Database connect ya data mutation nahi karta. Sirf current schema indexes,
| configured pool limits aur process settings ko print karta hai.
|
*/


function packageAvailable(
  packageName
) {
  try {
    require.resolve(packageName);
    return true;
  } catch (error) {
    return false;
  }
}

function printIndexSummary(
  modelName,
  model
) {
  const indexes =
    model.schema.indexes();

  console.log(
    `${modelName} schema indexes: ${indexes.length}`
  );

  indexes.forEach(
    ([fields, options], index) => {
      console.log(
        `  ${index + 1}.`,
        JSON.stringify(fields),
        options?.unique
          ? "[unique]"
          : ""
      );
    }
  );
}

console.log("");
console.log(
  "========================================"
);
console.log(
  "HimRideG Scalability Preflight"
);
console.log(
  "========================================"
);

console.log(
  "Environment:",
  process.env.NODE_ENV ||
    "development"
);

console.log(
  "Mongo max pool:",
  scalability.mongo.maxPoolSize
);

console.log(
  "Mongo min pool:",
  scalability.mongo.minPoolSize
);

console.log(
  "Slow request threshold (ms):",
  scalability.observability
    .slowRequestMs
);

console.log(
  "Ride mutation limit/min:",
  scalability.rateLimits
    .rideMutationPerMinute
);

console.log(
  "Live location limit/min:",
  scalability.rateLimits
    .liveLocationPerMinute
);

console.log(
  "Redis enabled:",
  scalability.redis.enabled
);

console.log(
  "Redis URL configured:",
  Boolean(scalability.redis.url)
);

console.log(
  "Socket Redis adapter enabled:",
  scalability.redis
    .socketAdapterEnabled
);

console.log(
  "Live location cache enabled:",
  scalability.liveLocation
    .cacheEnabled
);

console.log(
  "Mongo live-location persist interval (ms):",
  scalability.liveLocation
    .mongoPersistIntervalMs
);

console.log(
  "Background jobs enabled:",
  scalability.backgroundJobs
    .enabled
);

console.log(
  "redis package available:",
  packageAvailable("redis")
);

console.log(
  "@socket.io/redis-adapter available:",
  packageAvailable(
    "@socket.io/redis-adapter"
  )
);

console.log("");
printIndexSummary(
  "Booking",
  Booking
);

console.log("");
printIndexSummary(
  "User",
  User
);

console.log("");
console.log(
  "✅ Preflight complete — no data changed"
);
