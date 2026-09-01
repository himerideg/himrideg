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
