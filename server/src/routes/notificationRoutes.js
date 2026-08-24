const express = require("express");

const {
  protect
} = require("../middlewares/auth");

const {
  registerPushToken,
  unregisterPushToken,
  testPushNotification
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.post(
  "/register",
  registerPushToken
);

router.post(
  "/unregister",
  unregisterPushToken
);

router.post(
  "/test",
  testPushNotification
);

module.exports = router;
