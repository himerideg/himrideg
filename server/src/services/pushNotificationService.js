const User = require("../models/User");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

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
  categoryId = ""
}) {
  const tokens = await tokensForUserIds(userIds);

  if (!tokens.length) {
    return {
      sent: 0,
      skipped: "no-registered-device"
    };
  }

  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    priority: "high",
    title: String(title || "HimRideG"),
    body: String(body || ""),
    data: data || {},
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
  cleanToken,
  sendPushToUser,
  sendPushToUsers
};
