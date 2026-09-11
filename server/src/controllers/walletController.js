const walletService = require("../services/walletService");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const DriverPayoutMethod = require("../models/DriverPayoutMethod");
const PayoutMethodSecret = require("../models/PayoutMethodSecret");
const {
  fingerprint,
  maskAccount,
  maskUpi,
  saveSecret,
  getPlainMethodData,
  migrateDriverMethods,
  scrubLegacyUserPayoutDetails
} = require("../services/payoutDataProtectionService");

function fail(res, error, fallback) {
  const message = error?.message || fallback;
  const status = /not configured|configure|enable|encryption key/i.test(message)
    ? 503
    : /minimum|valid|required|insufficient|method|primary|sirf failed/i.test(message)
      ? 400
      : /nahi mila/i.test(message)
        ? 404
        : 500;
  return res.status(status).json({ success: false, message });
}

async function serializeMethod(method) {
  if (!method) return null;

  const secret = await getPlainMethodData(method);
  const upiId = method.type === "upi"
    ? String(secret?.upiId || "").trim().toLowerCase()
    : "";
  const accountNumber = method.type === "bank"
    ? String(secret?.accountNumber || "").replace(/\s+/g, "")
    : "";

  return {
    id: String(method._id),
    _id: String(method._id),
    type: method.type,
    label: method.label || "",
    upiId,
    maskedUpi: method.type === "upi" ? maskUpi(upiId) : "",
    accountHolderName: method.type === "bank"
      ? String(secret?.accountHolderName || method.accountHolderName || "")
      : "",
    bankName: method.type === "bank"
      ? String(secret?.bankName || method.bankName || "")
      : "",
    ifsc: method.type === "bank"
      ? String(secret?.ifsc || method.ifsc || "").toUpperCase()
      : "",
    maskedAccount: method.type === "bank"
      ? maskAccount(accountNumber || method.accountNumber)
      : "",
    isPrimary: Boolean(method.isPrimary),
    verified: Boolean(method.verified),
    secureStorage: Number(method.secretVersion || 0) >= 1,
    createdAt: method.createdAt,
    updatedAt: method.updatedAt
  };
}

function sanitizeWithdrawal(item) {
  const source = item?.toObject ? item.toObject() : { ...(item || {}) };
  const destination = source.destination || {};
  const rawAccount = String(destination.accountNumber || "");
  const rawUpi = String(destination.upiId || "");

  source.destination = {
    bankName: destination.bankName || "",
    accountHolderName: destination.accountHolderName || "",
    ifsc: destination.ifsc || "",
    maskedAccount:
      destination.maskedAccount ||
      maskAccount(rawAccount),
    maskedUpi: maskUpi(rawUpi),
    upiId: rawUpi ? maskUpi(rawUpi) : ""
  };

  return source;
}

async function listMethods(driverId) {
  await migrateDriverMethods(driverId);

  const methods = await DriverPayoutMethod.find({ driver: driverId })
    .sort({ isPrimary: -1, createdAt: -1 });

  return Promise.all(methods.map(serializeMethod));
}

async function ensurePrimary(driverId, preferredId = null) {
  let primary = null;
  if (preferredId) {
    primary = await DriverPayoutMethod.findOne({
      _id: preferredId,
      driver: driverId
    });
    if (!primary) throw new Error("Payment method nahi mila");
  } else {
    primary = await DriverPayoutMethod.findOne({
      driver: driverId,
      isPrimary: true
    });
  }

  if (!primary) {
    primary = await DriverPayoutMethod.findOne({ driver: driverId })
      .sort({ createdAt: 1 });
  }

  if (primary) {
    await DriverPayoutMethod.updateMany(
      {
        driver: driverId,
        _id: { $ne: primary._id }
      },
      { $set: { isPrimary: false } }
    );

    if (!primary.isPrimary) {
      primary.isPrimary = true;
      await primary.save();
    }
  }

  return primary;
}

function destinationFromSecret(method, secret) {
  if (!method || !secret) {
    throw new Error("Primary payout method secure data nahi mila");
  }

  if (method.type === "upi") {
    const upiId = String(secret.upiId || "").trim().toLowerCase();
    if (!upiId) throw new Error("Primary UPI ID required hai");
    return {
      method: "upi",
      destination: { upiId }
    };
  }

  const accountHolderName = String(secret.accountHolderName || "").trim();
  const bankName = String(secret.bankName || "").trim();
  const accountNumber = String(secret.accountNumber || "").replace(/\s+/g, "");
  const ifsc = String(secret.ifsc || "").trim().toUpperCase();

  if (!accountHolderName || !accountNumber || !ifsc) {
    throw new Error("Primary bank account secure data incomplete hai");
  }

  return {
    method: "bank",
    destination: {
      bankName,
      accountHolderName,
      accountNumber,
      ifsc
    }
  };
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
        withdrawals: withdrawals.map(sanitizeWithdrawal)
      }
    });
  } catch (error) {
    return fail(res, error, "Wallet load nahi ho saka");
  }
};

exports.savePayoutSettings = async (req, res) => {
  try {
    const data = await walletService.savePayoutSettings(
      req.user._id,
      req.body || {}
    );

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
  let createdMethod = null;

  try {
    const driverId = req.user._id;
    const type = String(req.body?.type || "").trim().toLowerCase();

    if (!["upi", "bank"].includes(type)) {
      throw new Error("Valid payout method required hai");
    }

    await migrateDriverMethods(driverId);

    const existingCount = await DriverPayoutMethod.countDocuments({
      driver: driverId
    });

    const payload = {
      driver: driverId,
      type,
      label: String(req.body?.label || "").trim(),
      isPrimary: existingCount === 0,
      verified: false,
      secretVersion: 1
    };

    let secretData = null;

    if (type === "upi") {
      const upiId = String(req.body?.upiId || "")
        .trim()
        .toLowerCase();

      if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        throw new Error("Valid UPI ID required hai");
      }

      const upiFingerprint = fingerprint(upiId);
      const duplicate = await DriverPayoutMethod.findOne({
        driver: driverId,
        type: "upi",
        upiFingerprint
      });

      if (duplicate) {
        return res.status(200).json({
          success: true,
          message: "UPI pehle se saved hai",
          data: { payoutMethods: await listMethods(driverId) }
        });
      }

      payload.upiFingerprint = upiFingerprint;
      payload.upiId = maskUpi(upiId);
      secretData = { upiId };
    } else {
      const accountHolderName = String(
        req.body?.accountHolderName || ""
      ).trim();
      const bankName = String(req.body?.bankName || "").trim();
      const accountNumber = String(req.body?.accountNumber || "")
        .replace(/\s+/g, "");
      const ifsc = String(req.body?.ifsc || "")
        .trim()
        .toUpperCase();

      if (!accountHolderName) {
        throw new Error("Account holder name required hai");
      }
      if (!bankName) throw new Error("Bank name required hai");
      if (!/^\d{6,20}$/.test(accountNumber)) {
        throw new Error("Valid account number required hai");
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        throw new Error("Valid IFSC required hai");
      }

      const bankFingerprint = fingerprint(
        `${accountNumber}|${ifsc}`
      );
      const duplicate = await DriverPayoutMethod.findOne({
        driver: driverId,
        type: "bank",
        bankFingerprint
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
      payload.accountNumber = maskAccount(accountNumber);
      payload.ifsc = ifsc;
      payload.bankFingerprint = bankFingerprint;

      secretData = {
        accountHolderName,
        bankName,
        accountNumber,
        ifsc
      };
    }

    createdMethod = await DriverPayoutMethod.create(payload);

    await saveSecret({
      driverId,
      payoutMethodId: createdMethod._id,
      data: secretData
    });

    return res.status(201).json({
      success: true,
      message: "Payment method securely save ho gaya",
      data: { payoutMethods: await listMethods(driverId) }
    });
  } catch (error) {
    if (createdMethod?._id) {
      await Promise.allSettled([
        DriverPayoutMethod.deleteOne({ _id: createdMethod._id }),
        PayoutMethodSecret.deleteOne({ payoutMethod: createdMethod._id })
      ]);
    }

    return fail(res, error, "Payment method save nahi hua");
  }
};

exports.setPrimaryPayoutMethod = async (req, res) => {
  try {
    const driverId = req.user._id;
    await migrateDriverMethods(driverId);

    const primary = await ensurePrimary(
      driverId,
      req.params?.methodId
    );

    return res.status(200).json({
      success: true,
      message: "Primary receiving account update ho gaya",
      data: {
        primaryPayoutMethod: await serializeMethod(primary),
        payoutMethods: await listMethods(driverId)
      }
    });
  } catch (error) {
    return fail(
      res,
      error,
      "Primary receiving account update nahi hua"
    );
  }
};

exports.deletePayoutMethod = async (req, res) => {
  try {
    const driverId = req.user._id;
    const method = await DriverPayoutMethod.findOne({
      _id: req.params?.methodId,
      driver: driverId
    });

    if (!method) throw new Error("Payment method nahi mila");

    const wasPrimary = Boolean(method.isPrimary);

    await Promise.all([
      method.deleteOne(),
      PayoutMethodSecret.deleteOne({ payoutMethod: method._id })
    ]);

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
    const driverId = req.user._id;
    await migrateDriverMethods(driverId);

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

    let saved = null;

    if (req.body?.payoutMethodId) {
      saved = await DriverPayoutMethod.findOne({
        _id: req.body.payoutMethodId,
        driver: driverId
      });
      if (!saved) throw new Error("Primary payout method nahi mila");
    } else if (!requestedMethod) {
      saved = await ensurePrimary(driverId);
      if (!saved) throw new Error("Primary payout method required hai");
    }

    if (saved) {
      const secret = await getPlainMethodData(saved);
      const secureDestination = destinationFromSecret(saved, secret);
      requestedMethod = secureDestination.method;
      destination = secureDestination.destination;
    }

    const withdrawal = await walletService.requestWithdrawal({
      driverId,
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
      data: sanitizeWithdrawal(withdrawal)
    });
  } catch (error) {
    return fail(res, error, "Withdrawal request nahi ho saki");
  } finally {
    // Razorpay fund-account token banne ke baad legacy User document me raw
    // account/UPI rakhna zaroori nahi. Saved method secret encrypted collection
    // me authoritative copy rehti hai.
    await scrubLegacyUserPayoutDetails(req.user?._id).catch(() => {});
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
      .filter(
        (item) =>
          String(item.status || "").toLowerCase() === "processed"
      )
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    return res.status(200).json({
      success: true,
      data: {
        month: month || null,
        totalWithdrawn:
          Math.round(totalWithdrawn * 100) / 100,
        withdrawals: withdrawals.map(sanitizeWithdrawal)
      }
    });
  } catch (error) {
    return fail(res, error, "Withdrawal history load nahi hui");
  }
};

exports.retryWithdrawal = async (req, res) => {
  try {
    const driverId = req.user._id;
    const previous = await WithdrawalRequest.findOne({
      _id: req.params?.withdrawalId,
      driver: driverId
    });

    if (!previous) throw new Error("Withdrawal request nahi mila");

    if (
      !["failed", "reversed", "cancelled"].includes(
        String(previous.status || "").toLowerCase()
      )
    ) {
      throw new Error("Sirf failed withdrawal ko retry kar sakte hain");
    }

    await migrateDriverMethods(driverId);
    const primary = await ensurePrimary(driverId);

    let method = previous.method;
    let destination = previous.destination || {};

    if (primary) {
      const secret = await getPlainMethodData(primary);
      const secureDestination = destinationFromSecret(primary, secret);
      method = secureDestination.method;
      destination = secureDestination.destination;
    }

    const withdrawal = await walletService.requestWithdrawal({
      driverId,
      amount: previous.amount,
      method,
      destination,
      source: "instant"
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal retry start ho gaya",
      data: sanitizeWithdrawal(withdrawal)
    });
  } catch (error) {
    return fail(res, error, "Withdrawal retry nahi hua");
  } finally {
    await scrubLegacyUserPayoutDetails(req.user?._id).catch(() => {});
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
