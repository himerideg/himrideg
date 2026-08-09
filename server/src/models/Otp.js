const mongoose = require("mongoose");
const OTP = require("../constants/otp");

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    purpose: {
      type: String,
      required: true,
      enum: Object.values(
        OTP.PURPOSES
      ),
      index: true
    },

    otpHash: {
      type: String,
      required: true,
      select: false
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0
      }
    },

    attempts: {
      type: Number,
      min: 0,
      default: 0
    },

    maxAttempts: {
      type: Number,
      min: 1,
      default:
        OTP.MAX_ATTEMPTS
    },

    resendCount: {
      type: Number,
      min: 0,
      default: 0
    },

    lastSentAt: {
      type: Date,
      default: Date.now
    },

    verified: {
      type: Boolean,
      default: false
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    ipAddress: {
      type: String,
      trim: true,
      default: ""
    },

    userAgent: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

otpSchema.index({
  phone: 1,
  purpose: 1,
  verified: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "Otp",
  otpSchema
);