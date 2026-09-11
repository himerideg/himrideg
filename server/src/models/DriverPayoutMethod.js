const mongoose = require("mongoose");

const driverPayoutMethodSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["upi", "bank"],
      required: true
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
      default: ""
    },
    accountHolderName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ""
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
      default: ""
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

driverPayoutMethodSchema.index({ driver: 1, createdAt: -1 });
driverPayoutMethodSchema.index({ driver: 1, isPrimary: 1 });

module.exports = mongoose.models.DriverPayoutMethod || mongoose.model("DriverPayoutMethod", driverPayoutMethodSchema);
