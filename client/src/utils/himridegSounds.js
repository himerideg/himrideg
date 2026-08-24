/*
|--------------------------------------------------------------------------
| HimRideG Web Sound Pack V24
|--------------------------------------------------------------------------
| 5 variants each: popup, payment, notification and ride bell.
| Audio playback in browsers requires a previous user interaction on some
| devices; failures are intentionally ignored so ride logic never breaks.
|--------------------------------------------------------------------------
*/

const SOUND_LIBRARY = {
  popup: [1, 2, 3, 4, 5].map((n) => `/sounds/popup_${n}.wav`),
  payment: [1, 2, 3, 4, 5].map((n) => `/sounds/payment_${n}.wav`),
  notification: [1, 2, 3, 4, 5].map((n) => `/sounds/notification_${n}.wav`),
  bell: [1, 2, 3, 4, 5].map((n) => `/sounds/bell_${n}.wav`)
};


const SOUND_EVENT_PROFILE = {
  ride_request: { group: "bell", variant: 1 },
  driver_accepted_customer: { group: "bell", variant: 2 },
  driver_nearby: { group: "bell", variant: 3 },
  driver_arrived: { group: "bell", variant: 4 },
  ride_cancelled: { group: "bell", variant: 5 },

  fare_initial: { group: "popup", variant: 1 },
  fare_counter: { group: "popup", variant: 2 },
  fare_final: { group: "popup", variant: 3 },
  fare_locked: { group: "popup", variant: 4 },
  otp: { group: "popup", variant: 5 },

  payment_required: { group: "payment", variant: 1 },
  cash_selected: { group: "payment", variant: 2 },
  online_payment_success: { group: "payment", variant: 3 },
  cash_payment_success: { group: "payment", variant: 4 },
  payment_received_driver: { group: "payment", variant: 5 },

  ride_booked: { group: "notification", variant: 1 },
  driver_arriving: { group: "notification", variant: 2 },
  ride_started: { group: "notification", variant: 3 },
  ride_completed: { group: "notification", variant: 4 },
  system_update: { group: "notification", variant: 5 }
};

const counters = {
  popup: 0,
  payment: 0,
  notification: 0,
  bell: 0
};

function normalizeGroup(group) {
  return SOUND_LIBRARY[group]
    ? group
    : "notification";
}

export function resolveHimRideGSoundEvent(text = "", data = {}) {
  const explicit = String(data?.soundEvent || data?.notificationEvent || "").trim().toLowerCase();
  if (SOUND_EVENT_PROFILE[explicit]) return explicit;

  const role = String(data?.role || "").toLowerCase();
  const value = [data?.type, data?.eventName, data?.event, data?.status, data?.fareStatus, data?.paymentMethod, text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (value.includes("ride_request") || value.includes("ride request") || value.includes("nayi ride") || value.includes("nearby customer")) return "ride_request";
  if (value.includes("ride_accepted") || value.includes("driver accepted") || value.includes("driver aa raha")) return role === "driver" ? "fare_initial" : "driver_accepted_customer";
  if (value.includes("driver_nearby") || value.includes("driver nearby")) return "driver_nearby";
  if (value.includes("ride_otp") || value.includes("otp") || value.includes("ride start otp")) return "otp";
  if (value.includes("driver_arrived") || value.includes("driver arrived")) return "driver_arrived";
  if (value.includes("customer-countered") || value.includes("customer counter") || value.includes("counter offer")) return "fare_counter";
  if (value.includes("final-offered") || value.includes("final fare")) return "fare_final";
  if (value.includes("fare:accepted") || value.includes("fare locked") || value.includes("fare accept")) return "fare_locked";
  if (value.includes("driver-offered") || value.includes("driver fare") || value.includes("fare offer")) return "fare_initial";
  if (value.includes("cash_selected") || value.includes("cash payment selected") || value.includes("cash select")) return "cash_selected";
  if (value.includes("payment_success") || value.includes("payment successful") || value.includes("payment received")) {
    if (role === "driver") return "payment_received_driver";
    return value.includes("cash") ? "cash_payment_success" : "online_payment_success";
  }
  if (value.includes("payment requested") || value.includes("payment:requested") || value.includes("choose payment") || value.includes("payment required")) return "payment_required";
  if (value.includes("driver_arriving") || value.includes("going to pickup") || value.includes("driver is coming")) return "driver_arriving";
  if (value.includes("ride_started") || value.includes("ride started")) return "ride_started";
  if (value.includes("ride_completed") || value.includes("ride completed") || value.includes("ride complete")) return "ride_completed";
  if (value.includes("cancel") || value.includes("reject") || value.includes("expired")) return "ride_cancelled";
  return "system_update";
}

export function inferHimRideGSoundGroup(text, fallback = "notification", data = {}) {
  const eventName = resolveHimRideGSoundEvent(text, data);
  return SOUND_EVENT_PROFILE[eventName]?.group || normalizeGroup(fallback);
}

export function getHimRideGSoundProfile(eventName = "system_update") {
  return SOUND_EVENT_PROFILE[eventName] || SOUND_EVENT_PROFILE.system_update;
}

export async function playHimRideGSound(group = "notification", variant = 0) {
  const safeGroup = normalizeGroup(group);
  const sounds = SOUND_LIBRARY[safeGroup];

  let index = Number(variant) - 1;

  if (!Number.isInteger(index) || index < 0 || index >= sounds.length) {
    index = counters[safeGroup] % sounds.length;
    counters[safeGroup] += 1;
  }

  try {
    const audio = new Audio(sounds[index]);
    audio.preload = "auto";
    audio.volume = safeGroup === "bell" ? 0.95 : 0.78;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export function playHimRideGEventSound(eventName = "system_update") {
  const profile = getHimRideGSoundProfile(eventName);
  return playHimRideGSound(profile.group, profile.variant);
}

export function playHimRideGSoundForText(text, fallback = "notification", data = {}) {
  const eventName = resolveHimRideGSoundEvent(text, data);
  const profile = SOUND_EVENT_PROFILE[eventName];

  if (profile) {
    return playHimRideGSound(profile.group, profile.variant);
  }

  return playHimRideGSound(inferHimRideGSoundGroup(text, fallback, data));
}

export function getHimRideGWebSoundLibrary() {
  return JSON.parse(JSON.stringify(SOUND_LIBRARY));
}
