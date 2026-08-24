const express = require("express");

const {
  protect
} = require("../middlewares/auth");

const {
  registerPushToken,
  unregisterPushToken
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

module.exports = router;
