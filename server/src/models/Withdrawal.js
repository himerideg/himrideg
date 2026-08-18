const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    payoutMethod: {
      type: String,
      enum: ["bank", "upi"],
      required: true
    },

    payoutSnapshot: {
      accountHolderName: { type: String, default: "" },
      accountNumberMasked: { type: String, default: "" },
      bankName: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      upiId: { type: String, default: "" }
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "paid",
        "cancelled"
      ],
      default: "pending",
      index: true
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000
    },

    payoutReference: {
      type: String,
      default: "",
      trim: true
    },

    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

withdrawalSchema.index({
  driver: 1,
  status: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "Withdrawal",
  withdrawalSchema
);
