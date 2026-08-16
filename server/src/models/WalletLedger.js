const mongoose = require("mongoose");

const walletLedgerSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true
    },

    type: {
      type: String,
      enum: [
        "cash_commission_debit",
        "cash_commission_due",
        "online_transfer",
        "online_wallet_fallback",
        "wallet_topup",
        "withdrawal_hold",
        "withdrawal_release",
        "withdrawal_paid",
        "admin_adjustment"
      ],
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    direction: {
      type: String,
      enum: ["credit", "debit", "info"],
      required: true
    },

    balanceBefore: {
      type: Number,
      default: 0
    },

    balanceAfter: {
      type: Number,
      default: 0
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    reference: {
      type: String,
      default: "",
      trim: true
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "WalletLedger",
  walletLedgerSchema
);
