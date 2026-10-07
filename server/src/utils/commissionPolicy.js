const SHORT_TRIP_MAX_KM = 15;
// Offer begins on 7 October 2026 (India); six calendar months end on 7 April 2027.
const PROMO_END_AT = "2027-04-07T00:00:00+05:30";
const SHORT_TRIP_COMMISSION_PERCENT = 0;
const LONG_TRIP_COMMISSION_PERCENT = 0;

// Default and database failure behavior: never charge an unapproved rate.
// The owner can explicitly switch commission ON during the offer.
let settings = {
  enabled: false,
  mode: "percent",
  shortTripMaxKm: SHORT_TRIP_MAX_KM,
  shortRate: 0,
  longRate: 0,
  // V94
  midTripMaxKm: null,
  midRate: 0,
  offUntil: null
};
let lastRefresh = 0;

// V94: 3-range rate. midTripMaxKm na ho to purana 2-range behaviour.
function rateForDistance(distanceKm) {
  const d = Number(distanceKm) || 0;
  if (d <= settings.shortTripMaxKm) return settings.shortRate;
  const mid = Number(settings.midTripMaxKm);
  if (Number.isFinite(mid) && mid > settings.shortTripMaxKm && d <= mid) return settings.midRate;
  return settings.longRate;
}

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
    if (candidate == null || candidate === "") continue;
    const n = Number(candidate);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function setCommissionSettings(row) {
  settings = {
    enabled: row?.enabled === true,
    mode: row?.mode === "per_km" ? "per_km" : "percent",
    shortTripMaxKm: Number(row?.shortTripMaxKm ?? SHORT_TRIP_MAX_KM),
    shortRate: Number(row?.shortRate ?? 0),
    longRate: Number(row?.longRate ?? 0),
    // V94
    midTripMaxKm: row?.midTripMaxKm == null || row?.midTripMaxKm === "" ? null : Number(row.midTripMaxKm),
    midRate: Number(row?.midRate ?? 0),
    offUntil: row?.offUntil ? new Date(row.offUntil).toISOString() : null
  };
  lastRefresh = Date.now();
}

function active() {
  return settings.enabled;
}

function getCommissionSettings() {
  return {
    ...settings,
    promoEndAt: settings.offUntil || PROMO_END_AT,
    active: active(),
    status: active()
      ? "active_by_admin"
      : Date.now() < Date.parse(settings.offUntil || PROMO_END_AT)
        ? "six_month_zero_commission"
        : "awaiting_admin_activation"
  };
}

async function refreshCommissionSettings(force = false) {
  if (!force && Date.now() - lastRefresh < 5000) return;
  lastRefresh = Date.now();
  try {
    const CommissionSettings = require("../models/CommissionSettings");
    const row = await CommissionSettings.findOne({ key: "global" }).lean();
    setCommissionSettings(row || { enabled: false });
  } catch (error) {
    // A DB outage cannot enable commission or revive old hard-coded percentages.
    settings.enabled = false;
  }
}

function commissionPercentForDistance(distanceKm) {
  if (!active() || settings.mode !== "percent") return 0;
  return rateForDistance(distanceKm);
}

function commissionPolicyForBooking(booking) {
  const distanceKm = distanceKmOf(booking);
  const fare = Number(booking?.finalFare ?? booking?.fare?.finalFare ?? 0);
  const result = commissionBreakdown(fare, booking);
  return {
    ...getCommissionSettings(),
    distanceKm,
    commissionPercent: result.commissionPercent,
    driverSharePercent: result.driverSharePercent,
    shortTripMaxKm: settings.shortTripMaxKm,
    shortTripCommissionPercent: settings.mode === "percent" && active() ? settings.shortRate : 0,
    longTripCommissionPercent: settings.mode === "percent" && active() ? settings.longRate : 0
  };
}

function commissionBreakdown(fare, bookingOrDistance) {
  const booking = typeof bookingOrDistance === "number" ? null : bookingOrDistance;
  const distanceKm = booking ? distanceKmOf(booking) : Math.max(0, Number(bookingOrDistance) || 0);
  const grossFare = roundMoney(fare);
  const snapshot = (booking?.commissionPolicyLockedAt || booking?.fareAcceptedAt) &&
    Number(booking?.finalFare ?? booking?.fare?.finalFare) === grossFare &&
    Number.isFinite(Number(booking?.platformCommissionAmount));
  const rate = active()
    ? rateForDistance(distanceKm)
    : 0;
  const calculated = settings.mode === "per_km"
    ? distanceKm * rate
    : grossFare * rate / 100;
  const platformCommission = snapshot
    ? roundMoney(Math.min(grossFare, booking.platformCommissionAmount))
    : roundMoney(Math.min(grossFare, calculated));
  const commissionPercent = grossFare > 0
    ? Math.round(platformCommission / grossFare * 10000) / 100
    : 0;
  return {
    grossFare,
    distanceKm,
    commissionPercent,
    driverSharePercent: 100 - commissionPercent,
    platformCommission,
    driverPayable: roundMoney(grossFare - platformCommission),
    commissionMode: active() ? settings.mode : "percent",
    rate: active() ? rate : 0
  };
}

module.exports = {
  SHORT_TRIP_MAX_KM,
  SHORT_TRIP_COMMISSION_PERCENT,
  LONG_TRIP_COMMISSION_PERCENT,
  PROMO_END_AT,
  distanceKmOf,
  commissionPercentForDistance,
  commissionPolicyForBooking,
  commissionBreakdown,
  getCommissionSettings,
  setCommissionSettings,
  refreshCommissionSettings,
  rateForDistance
};
