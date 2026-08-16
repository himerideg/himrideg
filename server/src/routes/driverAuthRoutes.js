const express = require("express");

const {
  sendDriverOtp,
  verifyDriverOtp
} = require("../controllers/driverAuthController");

const {
  otpLimiter,
  loginLimiter
} = require("../middlewares/rateLimits");

const router = express.Router();

router.post(
  "/send-otp",
  otpLimiter,
  sendDriverOtp
);

router.post(
  "/verify-otp",
  loginLimiter,
  verifyDriverOtp
);

module.exports = router;