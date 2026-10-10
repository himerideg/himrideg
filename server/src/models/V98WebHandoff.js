const mongoose = require("mongoose");

/*
| V98: one-time login code so a logged-in app user can open the website
| (e.g. driver documents upload) without logging in again.
| Only the SHA-256 hash of the code is stored. Expires in minutes, single use.
*/
const v98WebHandoffSchema = new mongoose.Schema(
  {
    codeHash: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purpose: { type: String, default: "driver_documents" },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// MongoDB removes expired codes automatically.
v98WebHandoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.V98WebHandoff ||
  mongoose.model("V98WebHandoff", v98WebHandoffSchema);
