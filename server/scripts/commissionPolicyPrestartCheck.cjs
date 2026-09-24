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

if (SHORT_TRIP_COMMISSION_PERCENT !== 8) {
  fail("0-15 km commission must be 8%");
}

if (LONG_TRIP_COMMISSION_PERCENT !== 5) {
  fail(">15 km commission must be 5%");
}

if (commissionPercentForDistance(0) !== 8) {
  fail("0 km policy check failed");
}

if (commissionPercentForDistance(15) !== 8) {
  fail("15 km policy check failed");
}

if (commissionPercentForDistance(15.01) !== 5) {
  fail(">15 km policy check failed");
}

console.log(
  "[HimRideG Commission] 0-15 km = 8% | >15 km = 5% | distance-based policy verified"
);
