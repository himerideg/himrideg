const crypto = require("crypto");
const DriverPayoutMethod = require("../models/DriverPayoutMethod");
const PayoutMethodSecret = require("../models/PayoutMethodSecret");
const User = require("../models/User");

function normalizeKey() {
  const raw = String(process.env.PAYOUT_DATA_ENCRYPTION_KEY || "").trim();
  if (!raw) {
    throw new Error("PAYOUT_DATA_ENCRYPTION_KEY missing hai");
  }

  let decoded = null;
  try {
    decoded = Buffer.from(raw, "base64url");
  } catch (_) {
    decoded = null;
  }

  if (decoded && decoded.length === 32) {
    return decoded;
  }

  return crypto.createHash("sha256").update(raw).digest();
}

function encryptPayload(payload) {
  const key = normalizeKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload || {}), "utf8");
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: authTag.toString("base64url")
  };
}

function decryptPayload(secret) {
  if (!secret) return null;
  const key = normalizeKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(secret.iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(secret.authTag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, "base64url")),
    decipher.final()
  ]);
  return JSON.parse(plaintext.toString("utf8"));
}

function fingerprint(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  return crypto
    .createHmac("sha256", normalizeKey())
    .update(normalized)
    .digest("hex");
}

function maskAccount(accountNumber) {
  const value = String(accountNumber || "").replace(/\s+/g, "");
  if (!value) return "";
  return value.length <= 4 ? value : `XXXX${value.slice(-4)}`;
}

function maskUpi(upiId) {
  const value = String(upiId || "").trim().toLowerCase();
  if (!value || !value.includes("@")) return value;
  const [name, handle] = value.split("@");
  if (name.length <= 2) return `${name[0] || "*"}***@${handle}`;
  return `${name.slice(0, 2)}***@${handle}`;
}

async function saveSecret({ driverId, payoutMethodId, data }) {
  const encrypted = encryptPayload(data);
  await PayoutMethodSecret.findOneAndUpdate(
    { payoutMethod: payoutMethodId },
    {
      $set: {
        driver: driverId,
        payoutMethod: payoutMethodId,
        ...encrypted,
        keyVersion: 1
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function readSecret(payoutMethodId) {
  const secret = await PayoutMethodSecret.findOne({
    payoutMethod: payoutMethodId
  }).select("+ciphertext +iv +authTag keyVersion");

  if (!secret) return null;
  return decryptPayload(secret);
}

async function migrateMethod(method) {
  if (!method) return null;

  const existingSecret = await readSecret(method._id);
  if (existingSecret) return existingSecret;

  let data = null;

  if (method.type === "upi") {
    const upiId = String(method.upiId || "").trim().toLowerCase();
    if (!upiId) return null;
    data = { upiId };
  } else {
    const accountNumber = String(method.accountNumber || "")
      .replace(/\s+/g, "");
    const ifsc = String(method.ifsc || "").trim().toUpperCase();
    const accountHolderName = String(
      method.accountHolderName || ""
    ).trim();
    const bankName = String(method.bankName || "").trim();

    if (!accountNumber || !ifsc || !accountHolderName) return null;

    data = {
      accountNumber,
      ifsc,
      accountHolderName,
      bankName
    };
  }

  await saveSecret({
    driverId: method.driver,
    payoutMethodId: method._id,
    data
  });

  if (method.type === "upi") {
    method.upiFingerprint = fingerprint(data.upiId);
    method.upiId = maskUpi(data.upiId);
  } else {
    method.bankFingerprint = fingerprint(
      `${data.accountNumber}|${data.ifsc}`
    );
    method.accountNumber = maskAccount(data.accountNumber);
  }

  method.secretVersion = 1;
  await method.save();
  return data;
}

async function getPlainMethodData(method) {
  if (!method) return null;
  const existing = await readSecret(method._id);
  if (existing) return existing;
  return migrateMethod(method);
}

async function migrateDriverMethods(driverId) {
  const methods = await DriverPayoutMethod.find({ driver: driverId });
  let migrated = 0;

  for (const method of methods) {
    const before = Number(method.secretVersion || 0);
    const data = await getPlainMethodData(method);
    if (data && before < 1) migrated += 1;
  }

  return { scanned: methods.length, migrated };
}

async function scrubLegacyUserPayoutDetails(driverId) {
  if (!driverId) return;

  await User.updateOne(
    { _id: driverId, role: "driver" },
    {
      $set: {
        "driverProfile.bankDetails.accountNumber": "",
        "driverProfile.bankDetails.upiId": ""
      }
    }
  );
}

async function migrateAllPayoutMethods({ scrubLegacy = true } = {}) {
  const methods = await DriverPayoutMethod.find({}).sort({ createdAt: 1 });
  const driverIds = new Set();
  let migrated = 0;
  let secured = 0;

  for (const method of methods) {
    try {
      const before = Number(method.secretVersion || 0);
      const data = await getPlainMethodData(method);
      if (!data) continue;

      secured += 1;
      driverIds.add(String(method.driver));
      if (before < 1) migrated += 1;
    } catch (error) {
      console.error(
        `[Payout Encryption Migration] method=${method._id}:`,
        error?.message || error
      );
    }
  }

  let scrubbedDrivers = 0;

  if (scrubLegacy) {
    for (const driverId of driverIds) {
      await scrubLegacyUserPayoutDetails(driverId);
      // Latest flow uses saved Primary payout method. Prevent the old scheduler
      // from depending on raw legacy bankDetails after those fields are scrubbed.
      await User.updateOne(
        { _id: driverId, role: "driver" },
        {
          $set: {
            "payoutSettings.autoPayoutEnabled": false,
            "payoutSettings.nextScheduledPayoutAt": null
          }
        }
      );
      scrubbedDrivers += 1;
    }
  }

  const summary = {
    scanned: methods.length,
    secured,
    migrated,
    scrubbedDrivers
  };

  console.log(
    `🔐 PAYOUT_DATA_MIGRATION ${JSON.stringify(summary)}`
  );

  return summary;
}

module.exports = {
  fingerprint,
  maskAccount,
  maskUpi,
  saveSecret,
  readSecret,
  migrateMethod,
  getPlainMethodData,
  migrateDriverMethods,
  scrubLegacyUserPayoutDetails,
  migrateAllPayoutMethods
};
