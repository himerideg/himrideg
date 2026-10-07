const mongoose = require("mongoose");

const commissionSettingsSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  enabled: { type: Boolean, default: false },
  mode: { type: String, enum: ["percent", "per_km"], default: "percent" },
  shortTripMaxKm: { type: Number, default: 15, min: 0 },
  shortRate: { type: Number, default: 0, min: 0 },
  longRate: { type: Number, default: 0, min: 0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
}, { timestamps: true });

module.exports = mongoose.model("CommissionSettings", commissionSettingsSchema);
