const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
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

    withdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
      default: null,
      index: true
    },

    type: {
      type: String,
      enum: [
        "ride_online_credit",
        "ride_cash_earning",
        "cash_commission_debit",
        "cash_commission_due",
        "payout_hold",
        "payout_success",
        "payout_refund",
        "manual_adjustment"
      ],
      required: true,
      index: true
    },

    direction: {
      type: String,
      enum: ["credit", "debit", "info"],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    balanceAfter: {
      type: Number,
      min: 0,
      default: 0
    },

    pendingAfter: {
      type: Number,
      min: 0,
      default: 0
    },

    cashCommissionDueAfter: {
      type: Number,
      min: 0,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "settled", "failed"],
      default: "settled",
      index: true
    },

    referenceId: {
      type: String,
      trim: true,
      default: "",
      index: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  { timestamps: true }
);

walletTransactionSchema.index({ driver: 1, createdAt: -1 });
walletTransactionSchema.index(
  { booking: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      booking: { $type: "objectId" },
      type: {
        $in: [
          "ride_online_credit",
          "ride_cash_earning",
          "cash_commission_debit",
          "cash_commission_due"
        ]
      }
    }
  }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
