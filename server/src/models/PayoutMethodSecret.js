const mongoose = require("mongoose");

const payoutMethodSecretSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    payoutMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverPayoutMethod",
      required: true,
      unique: true,
      index: true
    },
    ciphertext: {
      type: String,
      required: true,
      select: false
    },
    iv: {
      type: String,
      required: true,
      select: false
    },
    authTag: {
      type: String,
      required: true,
      select: false
    },
    keyVersion: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { timestamps: true }
);

payoutMethodSecretSchema.index({ driver: 1, updatedAt: -1 });

module.exports =
  mongoose.models.PayoutMethodSecret ||
  mongoose.model("PayoutMethodSecret", payoutMethodSecretSchema);
