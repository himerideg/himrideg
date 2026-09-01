const {
  rateLimit,
  ipKeyGenerator
} = require("express-rate-limit");

const {
  rateLimits: scalabilityRateLimits
} = require("../config/scalability");

function buildLimiter({
  windowMs,
  limit,
  message,
  keyGenerator
}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: {
      success: false,
      message
    },
    keyGenerator
  });
}

/*
|--------------------------------------------------------------------------
| Authenticated Rate Limit Key — ADD-ONLY
|--------------------------------------------------------------------------
| Mobile carrier / shared Wi-Fi NAT ke peeche multiple drivers ko ek IP
| bucket me daalne ke bajay login ke baad user ID ko primary key banata hai.
*/

function authenticatedUserKeyGenerator(req) {
  const userId =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;

  if (userId) {
    return `user:${String(userId)}`;
  }

  return `ip:${ipKeyGenerator(req.ip)}`;
}

const otpLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  message:
    "Bahut zyada OTP requests hui hain. 10 minute baad dobara try karein."
});

const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  message:
    "Bahut zyada login attempts hui hain. Thodi der baad dobara try karein."
});

const adminLoginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message:
    "Admin login attempts limit ho gayi hai. Thodi der baad try karein."
});

const paymentLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  message:
    "Payment requests temporarily limited hain. Thodi der baad try karein.",

  // ADD-ONLY: authenticated user bucket avoids shared mobile-IP collisions.
  keyGenerator:
    authenticatedUserKeyGenerator
});

const mutationLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit: 90,
  message:
    "Bahut zyada requests aa rahi hain. Ek minute baad try karein."
});

/* Ride state-changing actions: accept/reject/arrival/OTP/start/complete etc. */
const rideMutationLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit:
    scalabilityRateLimits
      .rideMutationPerMinute,
  message:
    "Ride actions bahut tezi se aa rahe hain. Thodi der baad dobara try karein.",
  keyGenerator:
    authenticatedUserKeyGenerator
});

/* Live GPS naturally higher frequency par aata hai, isliye separate bucket. */
const liveLocationLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit:
    scalabilityRateLimits
      .liveLocationPerMinute,
  message:
    "Live location updates temporarily limited hain. Ek moment baad retry karein.",
  keyGenerator:
    authenticatedUserKeyGenerator
});

module.exports = {
  otpLimiter,
  loginLimiter,
  adminLoginLimiter,
  paymentLimiter,
  mutationLimiter,
  rideMutationLimiter,
  liveLocationLimiter
};
