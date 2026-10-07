const {
  SHORT_TRIP_MAX_KM,
  SHORT_TRIP_COMMISSION_PERCENT,
  LONG_TRIP_COMMISSION_PERCENT,
  commissionPercentForDistance
} = require("../src/utils/commissionPolicy");

function fail(message) {
  console.error("[HimRideG Commission Prestart] " + message);
  process.exit(1);
}

if (SHORT_TRIP_MAX_KM !== 15) {
  fail("SHORT_TRIP_MAX_KM must be 15");
}

if (SHORT_TRIP_COMMISSION_PERCENT !== 0) {
  fail("Promotional commission default must be 0%");
}

if (LONG_TRIP_COMMISSION_PERCENT !== 0) {
  fail("Long distance promotional commission default must be 0%");
}

if (commissionPercentForDistance(0) !== 0) {
  fail("0 km policy check failed");
}

if (commissionPercentForDistance(15) !== 0) {
  fail("15 km policy check failed");
}

if (commissionPercentForDistance(15.01) !== 0) {
  fail(">15 km policy check failed");
}

console.log(
  "[HimRideG Commission] 0% until offer ends; paid policy requires admin activation"
);
