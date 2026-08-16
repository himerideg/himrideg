const { rateLimit } = require("express-rate-limit");

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
    "Payment requests temporarily limited hain. Thodi der baad try karein."
});

const mutationLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit: 90,
  message:
    "Bahut zyada requests aa rahi hain. Ek minute baad try karein."
});

module.exports = {
  otpLimiter,
  loginLimiter,
  adminLoginLimiter,
  paymentLimiter,
  mutationLimiter
};
