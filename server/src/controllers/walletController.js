const walletService = require("../services/walletService");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const DriverPayoutMethod = require("../models/DriverPayoutMethod");

function fail(res, error, fallback) {
  const message = error?.message || fallback;
  const status = /not configured|configure|enable/i.test(message)
    ? 503
    : /minimum|valid|required|insufficient|method|primary|sirf failed/i.test(message)
      ? 400
      : /nahi mila/i.test(message)
        ? 404
        : 500;
  return res.status(status).json({ success: false, message });
}

function maskAccount(accountNumber) {
  const value = String(accountNumber || "").replace(/\s+/g, "");
  if (!value) return "";
  return value.length <= 4 ? value : `XXXX${value.slice(-4)}`;
}

function serializeMethod(method) {
  if (!method) return null;
  return {
    id: String(method._id),
    _id: String(method._id),
    type: method.type,
    label: method.label || "",
    upiId: method.type === "upi" ? method.upiId : "",
    accountHolderName: method.type === "bank" ? method.accountHolderName : "",
    bankName: method.type === "bank" ? method.bankName : "",
    ifsc: method.type === "bank" ? method.ifsc : "",
    maskedAccount: method.type === "bank" ? maskAccount(method.accountNumber) : "",
    isPrimary: Boolean(method.isPrimary),
    verified: Boolean(method.verified),
    createdAt: method.createdAt,
    updatedAt: method.updatedAt
  };
}

async function listMethods(driverId) {
  const methods = await DriverPayoutMethod.find({ driver: driverId })
    .sort({ isPrimary: -1, createdAt: -1 });
  return methods.map(serializeMethod);
}

async function ensurePrimary(driverId, preferredId = null) {
  let primary = null;
  if (preferredId) {
    primary = await DriverPayoutMethod.findOne({ _id: preferredId, driver: driverId });
    if (!primary) throw new Error("Payment method nahi mila");
  } else {
    primary = await DriverPayoutMethod.findOne({ driver: driverId, isPrimary: true });
  }

  if (!primary) {
    primary = await DriverPayoutMethod.findOne({ driver: driverId }).sort({ createdAt: 1 });
  }

  if (primary) {
    await DriverPayoutMethod.updateMany(
      { driver: driverId, _id: { $ne: primary._id } },
      { $set: { isPrimary: false } }
    );
    if (!primary.isPrimary) {
      primary.isPrimary = true;
      await primary.save();
    }
  }

  return primary;
}

exports.getWallet = async (req, res) => {
  try {
    const [base, payoutMethods, withdrawals] = await Promise.all([
      walletService.getWalletSummary(req.user._id),
      listMethods(req.user._id),
      WithdrawalRequest.find({ driver: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...(base || {}),
        payoutMethods,
        withdrawals
      }
    });
  } catch (error) {
    return fail(res, error, "Wallet load nahi ho saka");
  }
};

exports.savePayoutSettings = async (req, res) => {
  try {
    const data = await walletService.savePayoutSettings(req.user._id, req.body || {});
    return res.status(200).json({
      success: true,
      message: "Payout settings save ho gayi",
      data
    });
  } catch (error) {
    return fail(res, error, "Payout settings save nahi ho saki");
  }
};

exports.addPayoutMethod = async (req, res) => {
  try {
    const driverId = req.user._id;
    const type = String(req.body?.type || "").trim().toLowerCase();
    if (!['upi', 'bank'].includes(type)) throw new Error("Valid payout method required hai");

    const existingCount = await DriverPayoutMethod.countDocuments({ driver: driverId });
    const payload = {
      driver: driverId,
      type,
      label: String(req.body?.label || "").trim(),
      isPrimary: existingCount === 0,
      verified: false
    };

    if (type === "upi") {
      const upiId = String(req.body?.upiId || "").trim().toLowerCase();
      if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        throw new Error("Valid UPI ID required hai");
      }
      const duplicate = await DriverPayoutMethod.findOne({ driver: driverId, type: "upi", upiId });
      if (duplicate) {
        return res.status(200).json({
          success: true,
          message: "UPI pehle se saved hai",
          data: { payoutMethods: await listMethods(driverId) }
        });
      }
      payload.upiId = upiId;
    } else {
      const accountHolderName = String(req.body?.accountHolderName || "").trim();
      const bankName = String(req.body?.bankName || "").trim();
      const accountNumber = String(req.body?.accountNumber || "").replace(/\s+/g, "");
      const ifsc = String(req.body?.ifsc || "").trim().toUpperCase();

      if (!accountHolderName) throw new Error("Account holder name required hai");
      if (!bankName) throw new Error("Bank name required hai");
      if (!/^\d{6,20}$/.test(accountNumber)) throw new Error("Valid account number required hai");
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) throw new Error("Valid IFSC required hai");

      const duplicate = await DriverPayoutMethod.findOne({
        driver: driverId,
        type: "bank",
        accountNumber,
        ifsc
      });
      if (duplicate) {
        return res.status(200).json({
          success: true,
          message: "Bank account pehle se saved hai",
          data: { payoutMethods: await listMethods(driverId) }
        });
      }

      payload.accountHolderName = accountHolderName;
      payload.bankName = bankName;
      payload.accountNumber = accountNumber;
      payload.ifsc = ifsc;
    }

    await DriverPayoutMethod.create(payload);

    return res.status(201).json({
      success: true,
      message: "Payment method save ho gaya",
      data: { payoutMethods: await listMethods(driverId) }
    });
  } catch (error) {
    return fail(res, error, "Payment method save nahi hua");
  }
};

exports.setPrimaryPayoutMethod = async (req, res) => {
  try {
    const driverId = req.user._id;
    const primary = await ensurePrimary(driverId, req.params?.methodId);
    return res.status(200).json({
      success: true,
      message: "Primary receiving account update ho gaya",
      data: {
        primaryPayoutMethod: serializeMethod(primary),
        payoutMethods: await listMethods(driverId)
      }
    });
  } catch (error) {
    return fail(res, error, "Primary receiving account update nahi hua");
  }
};

exports.deletePayoutMethod = async (req, res) => {
  try {
    const driverId = req.user._id;
    const method = await DriverPayoutMethod.findOne({ _id: req.params?.methodId, driver: driverId });
    if (!method) throw new Error("Payment method nahi mila");

    const wasPrimary = Boolean(method.isPrimary);
    await method.deleteOne();
    if (wasPrimary) await ensurePrimary(driverId);

    return res.status(200).json({
      success: true,
      message: "Payment method remove ho gaya",
      data: { payoutMethods: await listMethods(driverId) }
    });
  } catch (error) {
    return fail(res, error, "Payment method remove nahi hua");
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    let requestedMethod = ["bank", "upi"].includes(req.body?.method)
      ? req.body.method
      : undefined;

    let destination = {
      upiId: req.body?.upiId,
      bankName: req.body?.bankName,
      accountHolderName: req.body?.accountHolderName,
      accountNumber: req.body?.accountNumber,
      ifsc: req.body?.ifsc
    };

    if (req.body?.payoutMethodId) {
      const saved = await DriverPayoutMethod.findOne({
        _id: req.body.payoutMethodId,
        driver: req.user._id
      });
      if (!saved) throw new Error("Primary payout method nahi mila");
      requestedMethod = saved.type;
      destination = saved.type === "upi"
        ? { upiId: saved.upiId }
        : {
            bankName: saved.bankName,
            accountHolderName: saved.accountHolderName,
            accountNumber: saved.accountNumber,
            ifsc: saved.ifsc
          };
    } else if (!requestedMethod) {
      const primary = await ensurePrimary(req.user._id);
      if (!primary) throw new Error("Primary payout method required hai");
      requestedMethod = primary.type;
      destination = primary.type === "upi"
        ? { upiId: primary.upiId }
        : {
            bankName: primary.bankName,
            accountHolderName: primary.accountHolderName,
            accountNumber: primary.accountNumber,
            ifsc: primary.ifsc
          };
    }

    const withdrawal = await walletService.requestWithdrawal({
      driverId: req.user._id,
      amount: req.body?.amount,
      method: requestedMethod,
      destination,
      source: "instant"
    });

    return res.status(201).json({
      success: true,
      message:
        withdrawal.status === "processed"
          ? "Payout processed ho gaya"
          : withdrawal.status === "uncertain"
            ? "Payout request bank/RazorpayX confirmation me hai. Duplicate payout se bachne ke liye same request safely reconcile hogi."
            : "Payout RazorpayX ko submit ho gaya",
      data: withdrawal
    });
  } catch (error) {
    return fail(res, error, "Withdrawal request nahi ho saki");
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  try {
    const driverId = req.user._id;
    const month = String(req.query?.month || "").trim();
    const filter = { driver: driverId };

    if (/^\d{4}-\d{2}$/.test(month)) {
      const [year, monthNumber] = month.split("-").map(Number);
      const start = new Date(Date.UTC(year, monthNumber - 1, 1));
      const end = new Date(Date.UTC(year, monthNumber, 1));
      filter.createdAt = { $gte: start, $lt: end };
    }

    const withdrawals = await WithdrawalRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const totalWithdrawn = withdrawals
      .filter((item) => String(item.status || "").toLowerCase() === "processed")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        month: month || null,
        totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
        withdrawals
      }
    });
  } catch (error) {
    return fail(res, error, "Withdrawal history load nahi hui");
  }
};

exports.retryWithdrawal = async (req, res) => {
  try {
    const previous = await WithdrawalRequest.findOne({
      _id: req.params?.withdrawalId,
      driver: req.user._id
    });
    if (!previous) throw new Error("Withdrawal request nahi mila");

    if (!["failed", "reversed", "cancelled"].includes(String(previous.status || "").toLowerCase())) {
      throw new Error("Sirf failed withdrawal ko retry kar sakte hain");
    }

    const withdrawal = await walletService.requestWithdrawal({
      driverId: req.user._id,
      amount: previous.amount,
      method: previous.method,
      destination: previous.destination || {},
      source: "instant"
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal retry start ho gaya",
      data: withdrawal
    });
  } catch (error) {
    return fail(res, error, "Withdrawal retry nahi hua");
  }
};

exports.reconcilePayouts = async (req, res) => {
  try {
    await walletService.reconcilePendingPayouts(25);
    const data = await walletService.getWalletSummary(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return fail(res, error, "Payout status sync nahi ho saka");
  }
};
