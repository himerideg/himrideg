const CommissionSettings = require("../models/CommissionSettings");
const {
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
  try {
    const update = {
      enabled,
      mode,
      shortTripMaxKm: Number(shortTripMaxKm),
      shortRate: Number(shortRate),
      longRate: Number(longRate),
      updatedBy: req.user._id
    };
    // V93: change history ke liye purani settings
    const beforeRow = await CommissionSettings.findOne({ key: "global" }).lean();
    const row = await CommissionSettings.findOneAndUpdate(
      { key: "global" },
      { $set: update, $setOnInsert: { key: "global" } },
      { upsert: true, new: true, runValidators: true }
    );
    setCommissionSettings(row);
    // V93: audit log (fail hone par bhi save valid rahe)
    try {
      const pick = (r) => ({
        enabled: r?.enabled === true,
        mode: r?.mode || "percent",
        shortTripMaxKm: Number(r?.shortTripMaxKm ?? 15),
        shortRate: Number(r?.shortRate ?? 0),
        longRate: Number(r?.longRate ?? 0)
      });
      await require("../models/CommissionSettingsLog").create({
        changedBy: req.user._id,
        changedByName: String(req.user?.name || req.user?.email || "Admin"),
        before: pick(beforeRow),
        after: pick(row)
      });
    } catch (logError) {
      console.error("[Commission] history log failed:", logError?.message || logError);
    }
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

// V93: GET /api/v2/admin/commission/history
exports.getCommissionHistory = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Admin only" });
  try {
    const rows = await require("../models/CommissionSettingsLog")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, data: { history: rows } });
  } catch (error) {
    return res.status(503).json({ success: false, message: "History load nahi hui" });
  }
};
