const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  appRole: { type: String, enum: ["customer", "driver"], required: true, unique: true },
  platform: { type: String, default: "android", enum: ["android"] },
  version: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  message: { type: String, default: "A new HimRideG version is ready." },
  enabled: { type: Boolean, default: false },
  lastNotifiedAt: Date,
  notificationLockAt: Date,
  lastNotificationResult: mongoose.Schema.Types.Mixed
}, { timestamps: true });
module.exports = mongoose.models.AppRelease || mongoose.model("AppRelease", schema);
