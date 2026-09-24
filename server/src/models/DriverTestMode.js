const mongoose = require("mongoose");

const driverTestModeSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    enabled: {
      type: Boolean,
      default: false,
      index: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },
    lastResetAt: {
      type: Date,
      default: null
    },
    lastResetAmount: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DriverTestMode", driverTestModeSchema);
