const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const WalletLedger = require("../models/WalletLedger");

function requireAdmin(req) {
  if (req.user?.role !== "admin") {
    const error = new Error("Admin access required hai");
    error.statusCode = 403;
    throw error;
  }
}

async function listWithdrawals(req, res) {
  try {
    requireAdmin(req);

    const status = String(req.query?.status || "").trim();
    const filter = status && status !== "all" ? { status } : {};

    const withdrawals = await Withdrawal.find(filter)
      .populate("driver", "name phone email wallet driverProfile.bankDetails")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(300);

    return res.status(200).json({
      success: true,
      data: { withdrawals }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Withdrawal list load nahi hui"
    });
  }
}

async function updateWithdrawal(req, res) {
  try {
    requireAdmin(req);

    const action = String(req.params.action || "").toLowerCase();
    if (!["approve", "reject", "paid"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal action" });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Withdrawal request nahi mili" });
    }

    const note = String(req.body?.note || req.body?.adminNote || "").trim().slice(0, 1000);

    if (action === "approve") {
      if (withdrawal.status !== "pending") {
        return res.status(409).json({ success: false, message: "Sirf pending request approve ho sakti hai" });
      }

      withdrawal.status = "approved";
      withdrawal.reviewedAt = new Date();
      withdrawal.reviewedBy = req.user._id;
      withdrawal.adminNote = note;
      await withdrawal.save();
    }

    if (action === "reject") {
      if (!["pending", "approved"].includes(withdrawal.status)) {
        return res.status(409).json({ success: false, message: "Ye request reject nahi ho sakti" });
      }

      const driver = await User.findOneAndUpdate(
        {
          _id: withdrawal.driver,
          role: "driver",
          "wallet.pendingAmount": { $gte: withdrawal.amount }
        },
        {
          $inc: {
            "wallet.pendingAmount": -withdrawal.amount,
            "wallet.balance": withdrawal.amount
          }
        },
        { new: true }
      );

      withdrawal.status = "rejected";
      withdrawal.reviewedAt = new Date();
      withdrawal.reviewedBy = req.user._id;
      withdrawal.adminNote = note;
      await withdrawal.save();

      await WalletLedger.create({
        driver: withdrawal.driver,
        type: "withdrawal_release",
        amount: withdrawal.amount,
        direction: "credit",
        balanceBefore: Math.max(0, Number(driver?.wallet?.balance || 0) - withdrawal.amount),
        balanceAfter: Number(driver?.wallet?.balance || 0),
        idempotencyKey: `withdrawal:${withdrawal._id}:release`,
        reference: withdrawal._id.toString(),
        note: "Withdrawal rejected — amount wallet me release"
      }).catch((error) => {
        if (error?.code !== 11000) throw error;
      });
    }

    if (action === "paid") {
      if (withdrawal.status !== "approved") {
        return res.status(409).json({ success: false, message: "Withdrawal pehle approve karo" });
      }

      const driver = await User.findOneAndUpdate(
        {
          _id: withdrawal.driver,
          role: "driver",
          "wallet.pendingAmount": { $gte: withdrawal.amount }
        },
        {
          $inc: {
            "wallet.pendingAmount": -withdrawal.amount,
            "wallet.totalWithdrawn": withdrawal.amount
          }
        },
        { new: true }
      );

      if (!driver) {
        return res.status(409).json({ success: false, message: "Driver pending wallet amount mismatch hai" });
      }

      withdrawal.status = "paid";
      withdrawal.reviewedAt = new Date();
      withdrawal.reviewedBy = req.user._id;
      withdrawal.adminNote = note;
      withdrawal.payoutReference = String(req.body?.payoutReference || "").trim().slice(0, 200);
      withdrawal.paidAt = new Date();
      await withdrawal.save();

      await WalletLedger.create({
        driver: withdrawal.driver,
        type: "withdrawal_paid",
        amount: withdrawal.amount,
        direction: "info",
        balanceBefore: Number(driver.wallet?.balance || 0),
        balanceAfter: Number(driver.wallet?.balance || 0),
        idempotencyKey: `withdrawal:${withdrawal._id}:paid`,
        reference: withdrawal.payoutReference || withdrawal._id.toString(),
        note: "Admin marked withdrawal transferred"
      }).catch((error) => {
        if (error?.code !== 11000) throw error;
      });
    }

    const populated = await Withdrawal.findById(withdrawal._id)
      .populate("driver", "name phone email wallet")
      .populate("reviewedBy", "name email");

    return res.status(200).json({
      success: true,
      message: `Withdrawal ${action} successful`,
      data: { withdrawal: populated }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Withdrawal update nahi hui"
    });
  }
}

module.exports = {
  listWithdrawals,
  updateWithdrawal
};
