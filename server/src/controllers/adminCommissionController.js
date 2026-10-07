const CommissionSettings = require("../models/CommissionSettings");
const {
  PROMO_END_AT,
  getCommissionSettings,
  setCommissionSettings,
  commissionBreakdown
} = require("../utils/commissionPolicy");

function isAdmin(req) {
  return req.user?.role === "admin";
}

exports.getCommissionSettings = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Admin only" });
  try {
    const row = await CommissionSettings.findOne({ key: "global" }).lean();
    setCommissionSettings(row || { enabled: false });
    return res.json({ success: true, data: getCommissionSettings() });
  } catch (error) {
    return res.status(503).json({ success: false, message: "Commission settings load nahi hui" });
  }
};

exports.saveCommissionSettings = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Admin only" });
  const { enabled, mode, shortTripMaxKm, shortRate, longRate } = req.body || {};
  const validNumber = (value, max) =>
    value !== null && value !== "" && Number.isFinite(Number(value)) &&
    Number(value) >= 0 && Number(value) <= max;
  if (
    typeof enabled !== "boolean" ||
    !["percent", "per_km"].includes(mode) ||
    !validNumber(shortTripMaxKm, 10000) ||
    !validNumber(shortRate, mode === "percent" ? 100 : 10000) ||
    !validNumber(longRate, mode === "percent" ? 100 : 10000)
  ) {
    return res.status(400).json({ success: false, message: "Mode aur rates valid daaliye" });
  }
  if (enabled && Date.now() < Date.parse(PROMO_END_AT)) {
    return res.status(409).json({
      success: false,
      message: "6 mahine ke 0% offer ke baad hi commission activate kar sakte hain"
    });
  }
  try {
    const update = {
      enabled,
      mode,
      shortTripMaxKm: Number(shortTripMaxKm),
      shortRate: Number(shortRate),
      longRate: Number(longRate),
      updatedBy: req.user._id
    };
    const row = await CommissionSettings.findOneAndUpdate(
      { key: "global" },
      { $set: update, $setOnInsert: { key: "global" } },
      { upsert: true, new: true, runValidators: true }
    );
    setCommissionSettings(row);
    return res.json({ success: true, data: getCommissionSettings() });
  } catch (error) {
    return res.status(503).json({ success: false, message: "Commission settings save nahi hui" });
  }
};

exports.previewCommission = (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Admin only" });
  const fare = Number(req.body?.fare);
  const distanceKm = Number(req.body?.distanceKm);
  if (!Number.isFinite(fare) || fare < 0 || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return res.status(400).json({ success: false, message: "Fare aur km valid daaliye" });
  }
  return res.json({ success: true, data: commissionBreakdown(fare, distanceKm) });
};
