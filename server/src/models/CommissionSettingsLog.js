const mongoose = require("mongoose");

/*
| V93 (ADD-ONLY): Commission change history.
| Har ON/OFF ya rate badlav ka record — kisne, kab, pehle kya tha, ab kya hai.
| Driver dispute ya hisaab ke time pata chale ki kis din kaunsa rate tha.
*/
const commissionSettingsLogSchema = new mongoose.Schema({
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  changedByName: { type: String, default: "" },
  before: { type: Object, default: {} },
  after: { type: Object, default: {} }
}, { timestamps: true });

commissionSettingsLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CommissionSettingsLog", commissionSettingsLogSchema);
