const SHORT_TRIP_MAX_KM = 15;
const SHORT_TRIP_COMMISSION_PERCENT = 8;
const LONG_TRIP_COMMISSION_PERCENT = 5;

function roundMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
}

function distanceKmOf(booking) {
  const candidates = [
    booking?.distanceKm,
    booking?.fare?.distanceKm,
    booking?.estimatedDistanceKm,
    booking?.actualDistanceKm
  ];

  for (const candidate of candidates) {
    const n = Number(candidate);
    if (Number.isFinite(n) && n >= 0) return n;
  }

  return 0;
}

function commissionPercentForDistance(distanceKm) {
  const n = Number(distanceKm);
  const distance = Number.isFinite(n) && n >= 0 ? n : 0;
  return distance > SHORT_TRIP_MAX_KM
    ? LONG_TRIP_COMMISSION_PERCENT
    : SHORT_TRIP_COMMISSION_PERCENT;
}

function commissionPolicyForBooking(booking) {
  const distanceKm = distanceKmOf(booking);
  const commissionPercent = commissionPercentForDistance(distanceKm);
  return {
    distanceKm,
    commissionPercent,
    driverSharePercent: 100 - commissionPercent,
    shortTripMaxKm: SHORT_TRIP_MAX_KM,
    shortTripCommissionPercent: SHORT_TRIP_COMMISSION_PERCENT,
    longTripCommissionPercent: LONG_TRIP_COMMISSION_PERCENT
  };
}

function commissionBreakdown(fare, bookingOrDistance) {
  const distanceKm =
    typeof bookingOrDistance === "number"
      ? bookingOrDistance
      : distanceKmOf(bookingOrDistance);

  const commissionPercent = commissionPercentForDistance(distanceKm);
  const grossFare = roundMoney(fare);
  const platformCommission = roundMoney((grossFare * commissionPercent) / 100);
  const driverPayable = roundMoney(grossFare - platformCommission);

  return {
    grossFare,
    distanceKm,
    commissionPercent,
    driverSharePercent: 100 - commissionPercent,
    platformCommission,
    driverPayable
  };
}

module.exports = {
  SHORT_TRIP_MAX_KM,
  SHORT_TRIP_COMMISSION_PERCENT,
  LONG_TRIP_COMMISSION_PERCENT,
  distanceKmOf,
  commissionPercentForDistance,
  commissionPolicyForBooking,
  commissionBreakdown
};
