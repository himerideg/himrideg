const mongoose = require("mongoose");

const commissionSettingsSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  enabled: { type: Boolean, default: false },
  mode: { type: String, enum: ["percent", "per_km"], default: "percent" },
  shortTripMaxKm: { type: Number, default: 15, min: 0 },
  shortRate: { type: Number, default: 0, min: 0 },
  longRate: { type: Number, default: 0, min: 0 },
  // V94: 3 km ranges. Range 1: 0..shortTripMaxKm, Range 2: ..midTripMaxKm,
  // Range 3: above. midTripMaxKm null = purana 2-range rule.
  midTripMaxKm: { type: Number, default: null, min: 0 },
  midRate: { type: Number, default: 0, min: 0 },
  // V94: free period kab tak (sirf dikhane ke liye; apne-aap ON nahi hota)
  offUntil: { type: Date, default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
}, { timestamps: true });

module.exports = mongoose.model("CommissionSettings", commissionSettingsSchema);
