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

    /*
    |------------------------------------------------------------------
    | Display-only compatibility fields
    |------------------------------------------------------------------
    | V73 se full UPI/account number encrypted PayoutMethodSecret model me
    | store hota hai. Ye fields sirf masked display/legacy migration ke liye
    | preserve kiye gaye hain, taaki old app/backend data break na ho.
    */
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

    upiFingerprint: {
      type: String,
      trim: true,
      default: "",
      index: true
    },
    bankFingerprint: {
      type: String,
      trim: true,
      default: "",
      index: true
    },
    secretVersion: {
      type: Number,
      min: 0,
      default: 0
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
driverPayoutMethodSchema.index(
  { driver: 1, type: 1, upiFingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "upi",
      upiFingerprint: { $type: "string", $ne: "" }
    }
  }
);
driverPayoutMethodSchema.index(
  { driver: 1, type: 1, bankFingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "bank",
      bankFingerprint: { $type: "string", $ne: "" }
    }
  }
);

module.exports =
  mongoose.models.DriverPayoutMethod ||
  mongoose.model("DriverPayoutMethod", driverPayoutMethodSchema);
