const crypto = require("node:crypto");

const API_BASE = String(
  process.env.RAZORPAYX_API_BASE || "https://api.razorpay.com/v1"
).replace(/\/$/, "");

function keyId() {
  return String(
    process.env.RAZORPAYX_KEY_ID || process.env.RAZORPAY_KEY_ID || ""
  ).trim();
}

function keySecret() {
  return String(
    process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || ""
  ).trim();
}

function accountNumber() {
  return String(process.env.RAZORPAYX_ACCOUNT_NUMBER || "").trim();
}

function realMoneyMode() {
  return String(process.env.REAL_MONEY_MODE || "false").toLowerCase() === "true";
}

function isLiveKey() {
  return keyId().startsWith("rzp_live_");
}

function getConfigurationStatus() {
  const enabledFlag =
    String(process.env.RAZORPAYX_PAYOUTS_ENABLED || "false").toLowerCase() === "true";

  const missing = [];
  if (!enabledFlag) missing.push("RAZORPAYX_PAYOUTS_ENABLED=true");
  if (!keyId()) missing.push("RAZORPAYX_KEY_ID/RAZORPAY_KEY_ID");
  if (!keySecret()) missing.push("RAZORPAYX_KEY_SECRET/RAZORPAY_KEY_SECRET");
  if (!accountNumber()) missing.push("RAZORPAYX_ACCOUNT_NUMBER");
  if (realMoneyMode() && keyId() && !isLiveKey()) missing.push("rzp_live_ API key");

  return {
    enabledFlag,
    realMoneyMode: realMoneyMode(),
    liveKey: isLiveKey(),
    hasKeyId: Boolean(keyId()),
    hasKeySecret: Boolean(keySecret()),
    hasAccountNumber: Boolean(accountNumber()),
    missing,
    ready: missing.length === 0
  };
}

function isEnabled() {
  return getConfigurationStatus().ready;
}

async function request(
  path,
  {
    method = "GET",
    body,
    headers = {},
    timeoutMs = 30_000,
    payoutSubmission = false
  } = {}
) {
  const config = getConfigurationStatus();
  if (!config.ready) {
    const error = new Error(
      `RazorpayX live payout ready nahi hai: ${config.missing.join(", ")}`
    );
    error.code = "RAZORPAYX_NOT_CONFIGURED";
    error.statusCode = 503;
    throw error;
  }

  const auth = Buffer.from(`${keyId()}:${keySecret()}`).toString("base64");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const message =
        data?.error?.description ||
        data?.error?.reason ||
        data?.message ||
        `RazorpayX API error (${response.status})`;
      const error = new Error(message);
      error.statusCode = response.status;
      error.razorpay = data;

      // Create Payout par 5xx ka outcome unknown ho sakta hai. Wallet ko turant
      // refund karna double-spend bana sakta hai; same idempotency key se retry hoga.
      if (payoutSubmission && response.status >= 500) {
        error.payoutOutcomeUnknown = true;
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (
      payoutSubmission &&
      (error?.name === "AbortError" || error?.payoutOutcomeUnknown || !error?.statusCode)
    ) {
      error.payoutOutcomeUnknown = true;
      if (error?.name === "AbortError") {
        error.message = "RazorpayX payout request timeout hua; status safely reconcile ho raha hai";
      }
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function createContact(driver) {
  const name = String(
    driver?.driverProfile?.legalName || driver?.name || "HimRideG Driver"
  )
    .replace(/[^a-zA-Z0-9 ._()\/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);

  return request("/contacts", {
    method: "POST",
    body: {
      name: name.length >= 3 ? name : "HimRideG Driver",
      email: driver?.email || undefined,
      contact: String(driver?.phone || "").replace(/\D/g, "").slice(-10) || undefined,
      type: "employee",
      reference_id: `driver_${String(driver?._id || "").slice(-24)}`.slice(0, 40),
      notes: { platform: "HimRideG" }
    }
  });
}

async function createBankFundAccount({
  contactId,
  accountHolderName,
  accountNumber: driverAccount,
  ifsc
}) {
  return request("/fund_accounts", {
    method: "POST",
    body: {
      contact_id: contactId,
      account_type: "bank_account",
      bank_account: {
        name: String(accountHolderName || "").trim(),
        ifsc: String(ifsc || "").trim().toUpperCase(),
        account_number: String(driverAccount || "").trim()
      }
    }
  });
}

async function createUpiFundAccount({ contactId, upiId }) {
  return request("/fund_accounts", {
    method: "POST",
    body: {
      contact_id: contactId,
      account_type: "vpa",
      vpa: { address: String(upiId || "").trim().toLowerCase() }
    }
  });
}

async function createPayout({
  fundAccountId,
  amount,
  method,
  referenceId,
  idempotencyKey,
  driverId,
  queueIfLowBalance = false
}) {
  const mode = method === "upi" ? "UPI" : "IMPS";
  const paise = Math.round(Number(amount) * 100);

  if (!Number.isInteger(paise) || paise < 100) {
    const error = new Error("Payout amount valid nahi hai");
    error.statusCode = 400;
    throw error;
  }

  return request("/payouts", {
    method: "POST",
    payoutSubmission: true,
    headers: {
      "X-Payout-Idempotency": idempotencyKey
    },
    body: {
      account_number: accountNumber(),
      fund_account_id: fundAccountId,
      amount: paise,
      currency: "INR",
      mode,
      purpose: "payout",
      queue_if_low_balance: Boolean(queueIfLowBalance),
      reference_id: String(referenceId || "").slice(0, 40),
      narration: "HimRideG Driver Payout".slice(0, 30),
      notes: {
        driverId: String(driverId || ""),
        platform: "HimRideG"
      }
    }
  });
}

async function fetchPayout(payoutId) {
  return request(`/payouts/${encodeURIComponent(payoutId)}`);
}

async function checkLiveAccess() {
  return request(`/payouts?account_number=${encodeURIComponent(accountNumber())}&count=1`, {
    method: "GET",
    timeoutMs: 15_000
  });
}

function makeIdempotencyKey() {
  return crypto.randomUUID();
}

module.exports = {
  isEnabled,
  isLiveKey,
  getConfigurationStatus,
  createContact,
  createBankFundAccount,
  createUpiFundAccount,
  createPayout,
  fetchPayout,
  checkLiveAccess,
  makeIdempotencyKey
};
