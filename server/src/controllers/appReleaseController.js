const AppRelease = require("../models/AppRelease");
const User = require("../models/User");
const { cleanToken } = require("../services/pushNotificationService");
const { roles, validRelease } = require("../utils/appReleasePolicy");
const DAY = 24 * 60 * 60 * 1000;

exports.getRelease = async (req, res, next) => {
  if (!roles.has(req.params.appRole)) return res.status(400).json({ success: false, message: "Invalid app role" });
  try {
    const release = await AppRelease.findOne({ appRole: req.params.appRole, enabled: true })
      .select("appRole platform version downloadUrl message enabled").lean();
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, data: { release: release || null } });
  } catch (error) { return next(error); }
};
exports.listReleases = async (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin only" });
  try { return res.json({ success: true, data: { releases: await AppRelease.find().lean() } }); }
  catch (error) { return next(error); }
};
exports.saveRelease = async (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin only" });
  const role = req.params.appRole;
  if (!validRelease(role, req.body)) return res.status(400).json({ success: false, message: "Valid version, enabled flag and matching HimRideG APK URL required" });
  try {
    const release = await AppRelease.findOneAndUpdate(
      { appRole: role, $or: [{ notificationLockAt: null }, { notificationLockAt: { $lt: new Date(Date.now() - 10 * 60000) } }] },
      { $set: { appRole: role, version: req.body.version, enabled: req.body.enabled,
        downloadUrl: req.body.downloadUrl, message: String(req.body.message || "A new HimRideG version is ready.").slice(0, 300) } },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json({ success: true, data: { release } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Notification send in progress. Try later." });
    return next(error);
  }
};

// Called only by an explicit authenticated admin action; saving a release never sends pushes.
exports.notifyRelease = async (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin only" });
  const appRole = req.params.appRole;
  if (!roles.has(appRole) || req.body?.confirm !== true) return res.status(400).json({ success: false, message: "Explicit confirm:true required" });
  let release;
  const startedAt = new Date();
  try {
    release = await AppRelease.findOneAndUpdate({ appRole, enabled: true,
      $and: [
        { $or: [{ lastNotifiedAt: null }, { lastNotifiedAt: { $lte: new Date(Date.now() - DAY) } }] },
        { $or: [{ notificationLockAt: null }, { notificationLockAt: { $lt: new Date(Date.now() - 10 * 60000) } }] }
      ]
    }, { $set: { notificationLockAt: startedAt } }, { new: true }).lean();
    if (!release) return res.status(409).json({ success: false, message: "No enabled release, send already in progress, or notification sent within 24 hours" });
    const tokens = new Set();
    const cursor = User.find({ role: appRole, isActive: true, "fcmTokens.0": { $exists: true } }).select("fcmTokens").lean().cursor();
    for await (const user of cursor) for (const raw of user.fcmTokens || []) {
      const token = cleanToken(raw); if (token) tokens.add(token);
    }
    const result = { registeredDevices: tokens.size, acceptedByExpo: 0, rejectedByExpo: 0, deliveryConfirmed: false };
    const all = [...tokens];
    for (let index = 0; index < all.length; index += 100) {
      const messages = all.slice(index, index + 100).map(to => ({ to, title: "HimRideG update available",
        body: `Version ${release.version} is ready. Open HimRideG and tap Update Now.`, sound: "default", channelId: "hrg-default-v95", priority: "high", ttl: 86400,
        data: { type: "app_update", appRole, version: release.version, downloadUrl: release.downloadUrl, soundEvent: "system_update" } }));
      const response = await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(messages), signal: AbortSignal.timeout(15000) });
      const body = await response.json();
      if (!response.ok || !Array.isArray(body.data) || body.data.length !== messages.length) throw new Error("Push provider did not acknowledge this notification batch");
      for (const ticket of body.data) ticket.status === "ok" ? result.acceptedByExpo++ : result.rejectedByExpo++;
    }
    await AppRelease.updateOne({ _id: release._id, notificationLockAt: startedAt }, { $set: { lastNotifiedAt: new Date(), lastNotificationResult: result }, $unset: { notificationLockAt: "" } });
    return res.json({ success: true, data: result });
  } catch (error) {
    if (release) await AppRelease.updateOne({ _id: release._id, notificationLockAt: startedAt }, {
      $set: { lastNotifiedAt: new Date(), lastNotificationResult: { partialOrFailed: true, deliveryConfirmed: false } }, $unset: { notificationLockAt: "" }
    }).catch(() => {});
    return next(error);
  }
};
