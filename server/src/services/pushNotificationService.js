const User = require("../models/User");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/*
|--------------------------------------------------------------------------
| HimRideG V24 notification sound library
|--------------------------------------------------------------------------
|
| The app bundles 5 custom sounds for every category:
| - bell         -> nearby ride request / urgent driver bell
| - popup        -> fare / OTP / arrived / important action popup
| - payment      -> cash / online payment / payout events
| - notification -> normal ride/system updates
|
| Android 8+ binds a sound to the notification channel, so the backend sends
| the matching channelId together with the custom sound filename.
|
|--------------------------------------------------------------------------
*/

const SOUND_LIBRARY = {
  popup: [
    "popup_1.wav",
    "popup_2.wav",
    "popup_3.wav",
    "popup_4.wav",
    "popup_5.wav"
  ],
  payment: [
    "payment_1.wav",
    "payment_2.wav",
    "payment_3.wav",
    "payment_4.wav",
    "payment_5.wav"
  ],
  notification: [
    "notification_1.wav",
    "notification_2.wav",
    "notification_3.wav",
    "notification_4.wav",
    "notification_5.wav"
  ],
  bell: [
    "bell_1.wav",
    "bell_2.wav",
    "bell_3.wav",
    "bell_4.wav",
    "bell_5.wav"
  ]
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


function resolveSoundEvent(title, body, data = {}) {
  const explicit = String(
    data?.soundEvent ||
      data?.notificationEvent ||
      ""
  ).trim().toLowerCase();

  if (SOUND_EVENT_PROFILE[explicit]) {
    return explicit;
  }

  const role = String(data?.role || "").toLowerCase();
  const eventName = String(
    data?.eventName ||
      data?.event ||
      data?.type ||
      ""
  ).toLowerCase();

  const searchable = [
    eventName,
    data?.status,
    data?.fareStatus,
    data?.paymentMethod,
    title,
    body
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (searchable.includes("ride_request") || searchable.includes("new himrideg ride") || searchable.includes("new ride request") || searchable.includes("nayi ride request") || searchable.includes("nearby customer")) return "ride_request";
  if (searchable.includes("ride_accepted") || searchable.includes("driver accepted") || searchable.includes("driver aa raha")) return role === "driver" ? "fare_initial" : "driver_accepted_customer";
  if (searchable.includes("driver_nearby") || searchable.includes("driver nearby")) return "driver_nearby";
  if (searchable.includes("ride_otp") || searchable.includes("otp-generated") || searchable.includes("otp generated") || searchable.includes("ride start otp") || searchable.includes("ride otp")) return "otp";
  if (searchable.includes("driver_arrived") || searchable.includes("driver arrived") || searchable.includes("i have arrived")) return "driver_arrived";
  if (searchable.includes("fare:customer-countered") || searchable.includes("customer counter") || searchable.includes("counter offer")) return "fare_counter";
  if (searchable.includes("fare:final-offered") || searchable.includes("final fare")) return "fare_final";
  if (searchable.includes("fare:accepted") || searchable.includes("fare locked") || searchable.includes("fare accept")) return "fare_locked";
  if (searchable.includes("fare:driver-offered") || searchable.includes("driver fare offer") || searchable.includes("fare offer")) return "fare_initial";
  if (searchable.includes("cash_selected") || searchable.includes("cash payment selected") || searchable.includes("cash select")) return "cash_selected";
  if (searchable.includes("payment_success") || searchable.includes("payment successful") || searchable.includes("payment received")) {
    if (role === "driver") return "payment_received_driver";
    if (searchable.includes("cash")) return "cash_payment_success";
    return "online_payment_success";
  }
  if (searchable.includes("payment:requested") || searchable.includes("payment required") || searchable.includes("choose payment") || searchable.includes("payment method choose")) return "payment_required";
  if (searchable.includes("driver_arriving") || searchable.includes("going to pickup") || searchable.includes("driver is coming")) return "driver_arriving";
  if (searchable.includes("ride_started") || searchable.includes("ride started")) return "ride_started";
  if (searchable.includes("ride_completed") || searchable.includes("ride completed") || searchable.includes("ride complete")) return "ride_completed";
  if (searchable.includes("cancel") || searchable.includes("reject") || searchable.includes("expired")) return "ride_cancelled";

  return "system_update";
}

function cleanToken(value) {
  const token = String(value || "").trim();

  if (!token) {
    return "";
  }

  if (
    !/^ExponentPushToken\[[^\]]+\]$/.test(token) &&
    !/^ExpoPushToken\[[^\]]+\]$/.test(token)
  ) {
    return "";
  }

  return token;
}

function normalizeSoundGroup(value) {
  const group = String(value || "")
    .trim()
    .toLowerCase();

  return SOUND_LIBRARY[group]
    ? group
    : "notification";
}

function inferSoundGroup({
  title,
  body,
  data = {},
  soundGroup = ""
}) {
  const soundEvent = resolveSoundEvent(title, body, data);
  const profile = SOUND_EVENT_PROFILE[soundEvent];

  if (profile?.group && !soundGroup && !data?.soundGroup && !data?.soundCategory) {
    return profile.group;
  }

  const explicit = String(
    soundGroup ||
      data?.soundGroup ||
      data?.soundCategory ||
      ""
  )
    .trim()
    .toLowerCase();

  if (SOUND_LIBRARY[explicit]) {
    return explicit;
  }

  const searchable = [
    data?.type,
    data?.eventName,
    data?.event,
    data?.status,
    title,
    body
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    searchable.includes("ride_request") ||
    searchable.includes("new ride") ||
    searchable.includes("ride request") ||
    searchable.includes("nearby customer")
  ) {
    return "bell";
  }

  if (
    searchable.includes("payment") ||
    searchable.includes("cash") ||
    searchable.includes("razorpay") ||
    searchable.includes("paid") ||
    searchable.includes("payout")
  ) {
    return "payment";
  }

  if (
    searchable.includes("otp") ||
    searchable.includes("arrived") ||
    searchable.includes("fare") ||
    searchable.includes("counter") ||
    searchable.includes("accepted") ||
    searchable.includes("rejected") ||
    searchable.includes("popup")
  ) {
    return "popup";
  }

  return "notification";
}

function stableVariant(seed, max = 5) {
  const text = String(seed || "HimRideG");
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (
      (hash * 31) +
      text.charCodeAt(index)
    ) >>> 0;
  }

  return (hash % max) + 1;
}

function selectSound({
  title,
  body,
  data = {},
  soundGroup = "",
  soundVariant = 0
}) {
  const soundEvent = resolveSoundEvent(title, body, data);
  const profile = SOUND_EVENT_PROFILE[soundEvent] || SOUND_EVENT_PROFILE.system_update;
  const group = normalizeSoundGroup(
    soundGroup || data?.soundGroup || data?.soundCategory || profile.group
  );
  const sounds = SOUND_LIBRARY[group];

  const requested = Number(
    soundVariant || data?.soundVariant || data?.soundIndex || 0
  );
  const profileVariant = profile.group === group ? Number(profile.variant || 0) : 0;

  const variant = (
    Number.isInteger(requested) && requested >= 1 && requested <= sounds.length
  )
    ? requested
    : (Number.isInteger(profileVariant) && profileVariant >= 1 && profileVariant <= sounds.length)
      ? profileVariant
      : stableVariant(
          `${data?.bookingId || data?.rideId || ""}|${title || ""}|${body || ""}`,
          sounds.length
        );

  return {
    soundEvent,
    group,
    variant,
    sound: sounds[variant - 1],
    channelId: `himrideg-${group}-${variant}`
  };
}

async function sendExpoMessages(messages = []) {
  const safeMessages = messages.filter(Boolean);

  if (!safeMessages.length) {
    return {
      sent: 0,
      skipped: "no-messages"
    };
  }

  if (typeof fetch !== "function") {
    return {
      sent: 0,
      skipped: "fetch-unavailable"
    };
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(safeMessages)
    });

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      console.error(
        "Expo push failed:",
        response.status,
        data
      );

      return {
        sent: 0,
        failed: safeMessages.length,
        status: response.status
      };
    }

    return {
      sent: safeMessages.length,
      data
    };
  } catch (error) {
    console.error(
      "Expo push error:",
      error.message
    );

    return {
      sent: 0,
      failed: safeMessages.length,
      error: error.message
    };
  }
}

async function tokensForUserIds(userIds = []) {
  const ids = Array.from(
    new Set(
      userIds
        .filter(Boolean)
        .map(String)
    )
  );

  if (!ids.length) {
    return [];
  }

  const users = await User.find({
    _id: {
      $in: ids
    }
  })
    .select("fcmTokens")
    .lean();

  const tokens = [];

  users.forEach((user) => {
    (user?.fcmTokens || []).forEach((rawToken) => {
      const token = cleanToken(rawToken);

      if (token) {
        tokens.push(token);
      }
    });
  });

  return Array.from(new Set(tokens));
}

async function sendPushToUsers({
  userIds = [],
  title,
  body,
  data = {},
  categoryId = "",
  soundGroup = "",
  soundVariant = 0
}) {
  const tokens = await tokensForUserIds(userIds);

  if (!tokens.length) {
    return {
      sent: 0,
      skipped: "no-registered-device"
    };
  }

  const soundSelection = selectSound({
    title,
    body,
    data,
    soundGroup,
    soundVariant
  });

  const payloadData = {
    ...(data || {}),
    soundEvent: soundSelection.soundEvent,
    soundGroup: soundSelection.group,
    soundVariant: soundSelection.variant
  };

  const messages = tokens.map((to) => ({
    to,
    sound: soundSelection.sound,
    priority: "high",
    channelId: soundSelection.channelId,
    ttl: 900,
    title: String(title || "HimRideG"),
    body: String(body || ""),
    data: payloadData,
    ...(categoryId
      ? {
          categoryId
        }
      : {})
  }));

  return sendExpoMessages(messages);
}

async function sendPushToUser(userId, options = {}) {
  if (!userId) {
    return {
      sent: 0,
      skipped: "no-user"
    };
  }

  return sendPushToUsers({
    ...options,
    userIds: [String(userId)]
  });
}

module.exports = {
  SOUND_LIBRARY,
  SOUND_EVENT_PROFILE,
  resolveSoundEvent,
  cleanToken,
  inferSoundGroup,
  selectSound,
  sendPushToUser,
  sendPushToUsers
};
