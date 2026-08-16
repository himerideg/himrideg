const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const User = require("../models/User");
const WalletLedger = require("../models/WalletLedger");
const Withdrawal = require("../models/Withdrawal");

function driverId(req) {
  return req.user?._id || req.user?.id;
}

function requireDriver(req) {
  if (req.user?.role !== "driver") {
    const error = new Error("Sirf driver wallet access kar sakta hai");
    error.statusCode = 403;
    throw error;
  }
}

function maskAccount(value) {
  const text = String(value || "").replace(/\s+/g, "");
  if (!text) return "";
  if (text.length <= 4) return text;
  return `${"*".repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`;
}

async function getDriverWallet(req, res) {
  try {
    requireDriver(req);

    const driver = await User.findById(driverId(req)).select(
      "wallet driverProfile.bankDetails driverProfile.razorpayLinkedAccountId driverProfile.razorpayRouteStatus isOnline isAvailable"
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver nahi mila" });
    }

    const ledger = await WalletLedger.find({ driver: driver._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: {
        wallet: driver.wallet,
        bankDetails: {
          accountHolderName: driver.driverProfile?.bankDetails?.accountHolderName || "",
          accountNumberMasked: maskAccount(driver.driverProfile?.bankDetails?.accountNumber),
          bankName: driver.driverProfile?.bankDetails?.bankName || "",
          ifscCode: driver.driverProfile?.bankDetails?.ifscCode || "",
          upiId: driver.driverProfile?.bankDetails?.upiId || "",
          verified: Boolean(driver.driverProfile?.bankDetails?.verified)
        },
        razorpayRoute: {
          configured: Boolean(driver.driverProfile?.razorpayLinkedAccountId),
          status: driver.driverProfile?.razorpayRouteStatus || "not_created"
        },
        ledger
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Wallet load nahi hua"
    });
  }
}

async function createTopupOrder(req, res) {
  try {
    requireDriver(req);

    const amount = Math.round(Number(req.body?.amount || 0));
    if (!Number.isFinite(amount) || amount < 100 || amount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Wallet top-up ₹100 se ₹50,000 ke beech hona chahiye"
      });
    }

    const driver = await User.findById(driverId(req)).select("name phone wallet");
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver nahi mila" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `WAL_${driver._id.toString().slice(-10)}_${Date.now().toString().slice(-8)}`,
      notes: {
        purpose: "driver_wallet_topup",
        driverId: driver._id.toString(),
        amount: String(amount)
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        topupAmount: amount,
        driverName: driver.name || "Driver",
        driverPhone: driver.phone || ""
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.error?.description || error.message || "Top-up order create nahi hua"
    });
  }
}

async function verifyTopup(req, res) {
  try {
    requireDriver(req);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    } = req.body || {};

    const topupAmount = Math.round(Number(amount || 0));

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !Number.isFinite(topupAmount) ||
      topupAmount < 100 ||
      topupAmount > 50000
    ) {
      return res.status(400).json({ success: false, message: "Top-up verification details invalid hain" });
    }

    const expected = crypto
      .createHmac("sha256", String(process.env.RAZORPAY_KEY_SECRET || ""))
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(String(razorpay_signature), "utf8");
    const b = Buffer.from(expected, "utf8");

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(400).json({ success: false, message: "Top-up payment signature invalid hai" });
    }

    const key = `topup:${razorpay_payment_id}`;
    const existing = await WalletLedger.findOne({ idempotencyKey: key });
    if (existing) {
      const driver = await User.findById(driverId(req)).select("wallet isOnline isAvailable");
      return res.status(200).json({
        success: true,
        message: "Top-up already credited hai",
        data: {
          wallet: driver?.wallet || null,
          idempotent: true
        }
      });
    }

    const driver = await User.findOne({ _id: driverId(req), role: "driver" });
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver nahi mila" });
    }

    const before = Number(driver.wallet?.balance || 0);
    const dueBefore = Number(driver.wallet?.commissionDue || 0);
    const duePayment = Math.min(topupAmount, dueBefore);
    const walletCredit = topupAmount - duePayment;

    driver.wallet.balance = before + walletCredit;
    driver.wallet.commissionDue = Math.max(0, dueBefore - duePayment);
    driver.wallet.totalCommissionPaid = Number(driver.wallet.totalCommissionPaid || 0) + duePayment;

    if (
      driver.wallet.commissionDue <= 0 &&
      driver.isOnline &&
      !driver.currentRide
    ) {
      driver.isAvailable = true;
    }

    await driver.save();

    await WalletLedger.create({
      driver: driver._id,
      type: "wallet_topup",
      amount: topupAmount,
      direction: "credit",
      balanceBefore: before,
      balanceAfter: Number(driver.wallet.balance || 0),
      idempotencyKey: key,
      reference: razorpay_payment_id,
      note:
        duePayment > 0
          ? `Top-up ₹${topupAmount}; commission due ₹${duePayment} automatically clear hua`
          : `Wallet top-up ₹${topupAmount}`,
      metadata: {
        razorpayOrderId: razorpay_order_id,
        commissionDueCleared: duePayment,
        walletCredit
      }
    });

    return res.status(200).json({
      success: true,
      message:
        duePayment > 0
          ? "Wallet top-up hua aur commission due automatically clear hua"
          : "Wallet top-up successful",
      data: {
        wallet: driver.wallet,
        commissionDueCleared: duePayment,
        walletCredit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Top-up verify nahi hua"
    });
  }
}

async function requestWithdrawal(req, res) {
  try {
    requireDriver(req);

    const amount = Math.round(Number(req.body?.amount || 0));
    const payoutMethod = String(req.body?.payoutMethod || "bank").toLowerCase();

    if (!Number.isFinite(amount) || amount < 100) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal ₹100 hai" });
    }

    if (!["bank", "upi"].includes(payoutMethod)) {
      return res.status(400).json({ success: false, message: "Valid payout method select karo" });
    }

    const driver = await User.findOneAndUpdate(
      {
        _id: driverId(req),
        role: "driver",
        "wallet.balance": { $gte: amount }
      },
      {
        $inc: {
          "wallet.balance": -amount,
          "wallet.pendingAmount": amount
        }
      },
      { new: true }
    );

    if (!driver) {
      return res.status(409).json({ success: false, message: "Wallet balance kam hai" });
    }

    const bank = driver.driverProfile?.bankDetails || {};

    if (
      payoutMethod === "bank" &&
      (!bank.accountNumber || !bank.ifscCode)
    ) {
      await User.updateOne(
        { _id: driver._id },
        {
          $inc: {
            "wallet.balance": amount,
            "wallet.pendingAmount": -amount
          }
        }
      );

      return res.status(409).json({ success: false, message: "Bank account details complete nahi hain" });
    }

    if (payoutMethod === "upi" && !bank.upiId) {
      await User.updateOne(
        { _id: driver._id },
        {
          $inc: {
            "wallet.balance": amount,
            "wallet.pendingAmount": -amount
          }
        }
      );

      return res.status(409).json({ success: false, message: "UPI ID configured nahi hai" });
    }

    const withdrawal = await Withdrawal.create({
      driver: driver._id,
      amount,
      payoutMethod,
      payoutSnapshot: {
        accountHolderName: bank.accountHolderName || "",
        accountNumberMasked: maskAccount(bank.accountNumber),
        bankName: bank.bankName || "",
        ifscCode: bank.ifscCode || "",
        upiId: bank.upiId || ""
      }
    });

    await WalletLedger.create({
      driver: driver._id,
      type: "withdrawal_hold",
      amount,
      direction: "debit",
      balanceBefore: Number(driver.wallet.balance || 0) + amount,
      balanceAfter: Number(driver.wallet.balance || 0),
      idempotencyKey: `withdrawal:${withdrawal._id}:hold`,
      reference: withdrawal._id.toString(),
      note: "Withdrawal request pending"
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request admin ko bhej di gayi",
      data: {
        withdrawal,
        wallet: driver.wallet
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Withdrawal request nahi bani"
    });
  }
}

async function getMyWithdrawals(req, res) {
  try {
    requireDriver(req);
    const withdrawals = await Withdrawal.find({ driver: driverId(req) })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, data: { withdrawals } });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Withdrawals load nahi hui" });
  }
}

module.exports = {
  getDriverWallet,
  createTopupOrder,
  verifyTopup,
  requestWithdrawal,
  getMyWithdrawals
};
