/*
|--------------------------------------------------------------------------
| V98 App -> Website handoff (driver documents in browser)
|--------------------------------------------------------------------------
| POST /api/v2/auth/v98/web-handoff           (auth)  -> { code, url }
| POST /api/v2/auth/v98/web-handoff/exchange  (public) -> same shape as login
|
| The driver app opens https://himrideg.com/?hrgHandoff=<code>&hrgNext=driver-docs
| in the phone browser. The website swaps the code for a normal web session
| (access token + refresh cookie), so the driver can upload document photos
| from the browser's file picker / camera.
*/

const crypto = require("crypto");
const User = require("../models/User");
const V98WebHandoff = require("../models/V98WebHandoff");
const { generateAuthTokens } = require("../services/tokenService");
const authController = require("./authController");

const TTL_MS = 3 * 60 * 1000;
const sha = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

function webBase() {
  const fromEnv = String(process.env.CLIENT_URL || "")
    .split(",")
    .map((v) => v.trim())
    .find((v) => /^https:\/\/(www\.)?himrideg\.com$/i.test(v));
  return fromEnv || "https://himrideg.com";
}

function accountBlockedMessage(user) {
  const status = String(user?.accountStatus || "");
  if (status === "blocked") return user.blockReason || "Your account has been blocked";
  if (status === "suspended" || status === "deleted") return `Your account is ${status}`;
  if (user?.isActive === false || status === "inactive") return "Your account is inactive";
  return "";
}

exports.createWebHandoff = async (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) return res.status(401).json({ success: false, message: "Login required" });

    const blocked = accountBlockedMessage(user);
    if (blocked) return res.status(403).json({ success: false, message: blocked });

    const next = String(req.body?.next || "driver-docs").replace(/[^a-z-]/gi, "").slice(0, 30) || "driver-docs";
    const code = crypto.randomBytes(32).toString("base64url");

    await V98WebHandoff.create({
      codeHash: sha(code),
      user: user._id,
      purpose: next,
      expiresAt: new Date(Date.now() + TTL_MS)
    });

    const url = `${webBase()}/?hrgHandoff=${encodeURIComponent(code)}&hrgNext=${encodeURIComponent(next)}`;
    return res.status(201).json({
      success: true,
      data: { code, url, expiresInSeconds: TTL_MS / 1000 }
    });
  } catch (error) {
    console.error("[V98] create web handoff:", error?.message || error);
    return res.status(500).json({ success: false, message: "Website link nahi ban saka. Dobara try karein." });
  }
};

exports.exchangeWebHandoff = async (req, res) => {
  try {
    const code = String(req.body?.code || "").trim();
    if (!code || code.length < 20 || code.length > 100) {
      return res.status(400).json({ success: false, message: "Invalid link" });
    }

    // Atomic single use: only the first request can claim the code.
    const record = await V98WebHandoff.findOneAndUpdate(
      { codeHash: sha(code), usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { usedAt: new Date() } },
      { new: true }
    );
    if (!record) {
      return res.status(410).json({
        success: false,
        message: "Ye link expire ho gaya hai. App me dobara 'Upload on Website' dabayein."
      });
    }

    const user = await User.findById(record.user);
    if (!user) return res.status(404).json({ success: false, message: "Account nahi mila" });

    const blocked = accountBlockedMessage(user);
    if (blocked) return res.status(403).json({ success: false, message: blocked });

    const { setRefreshTokenCookie, buildRefreshSessionHashes, toSafeUserObject } = authController.v98 || {};
    if (!setRefreshTokenCookie || !buildRefreshSessionHashes || !toSafeUserObject) {
      throw new Error("auth helpers unavailable");
    }

    const { accessToken, refreshToken, refreshTokenHash } = generateAuthTokens(user);
    const refreshTokenHashes = await buildRefreshSessionHashes(user._id, refreshTokenHash);
    user.refreshTokenHash = refreshTokenHash;
    user.refreshTokenHashes = refreshTokenHashes;
    await user.save();

    setRefreshTokenCookie(res, refreshToken, user.role);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: toSafeUserObject(user),
        next: record.purpose || "driver-docs"
      },
      message: "Login successful"
    });
  } catch (error) {
    console.error("[V98] exchange web handoff:", error?.message || error);
    return res.status(500).json({ success: false, message: "Website login nahi ho saka. App se dobara try karein." });
  }
};
