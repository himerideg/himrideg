const express = require("express");

const {
  sendDriverOtp,
  verifyDriverOtp
} = require("../controllers/driverAuthController");

const router = express.Router();

router.post(
  "/send-otp",
  sendDriverOtp
);

router.post(
  "/verify-otp",
  verifyDriverOtp
);

module.exports = router;