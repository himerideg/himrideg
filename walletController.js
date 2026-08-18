const walletService = require("../services/walletService");

function fail(res, error, fallback) {
  const message = error?.message || fallback;
  const status = /not configured|configure|enable/i.test(message)
    ? 503
    : /minimum|valid|required|insufficient|method/i.test(message)
      ? 400
      : /nahi mila/i.test(message)
        ? 404
        : 500;
  return res.status(status).json({ success: false, message });
}

exports.getWallet = async (req, res) => {
  try {
    const data = await walletService.getWalletSummary(req.user._id);
    return res.status(200).json({ success: true, data });
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

exports.requestWithdrawal = async (req, res) => {
  try {
    const method = req.body?.method === "bank" ? "bank" : "upi";
    const withdrawal = await walletService.requestWithdrawal({
      driverId: req.user._id,
      amount: req.body?.amount,
      method,
      destination: {
        upiId: req.body?.upiId,
        bankName: req.body?.bankName,
        accountHolderName: req.body?.accountHolderName,
        accountNumber: req.body?.accountNumber,
        ifsc: req.body?.ifsc
      },
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

exports.reconcilePayouts = async (req, res) => {
  try {
    await walletService.reconcilePendingPayouts(25);
    const data = await walletService.getWalletSummary(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return fail(res, error, "Payout status sync nahi ho saka");
  }
};
