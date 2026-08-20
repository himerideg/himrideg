const Otp = require("../models/Otp");
const User = require("../models/User");

const OTP = require("../constants/otp");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const {
  generateOtp,
  hashOtp,
  verifyOtp,
  getExpiryTime,
  isExpired
} = require("../services/otpService");

const {
  sendOtpSms
} = require("../services/smsService");

const {
  generateAuthTokens
} = require("../services/tokenService");

const {
  validateDriverSendOtp,
  validateDriverVerifyOtp
} = require("../validators/driverAuthValidator");

const getRequestIp = (req) => {
  return (
    req.headers["x-forwarded-for"]
      ?.split(",")[0]
      ?.trim() ||
    req.socket.remoteAddress ||
    ""
  );
};

const normalizeSameSite = (
  value,
  isProduction
) => {
  const requested =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    requested === "strict" ||
    requested === "lax" ||
    requested === "none"
  ) {
    return requested;
  }

  return isProduction
    ? "none"
    : "lax";
};

const setRefreshTokenCookie = (
  res,
  refreshToken
) => {
  const isProduction =
    process.env.NODE_ENV === "production";

  const secureCookie =
    process.env.COOKIE_SECURE ===
      "true" || isProduction;

  const sameSite =
    normalizeSameSite(
      process.env.COOKIE_SAME_SITE,
      isProduction
    );

  res.cookie(
    "refreshToken",
    refreshToken,
    {
      httpOnly: true,
      secure:
        secureCookie,
      sameSite,
      path: "/",
      maxAge:
        7 * 24 * 60 * 60 * 1000
    }
  );
};

/*
|--------------------------------------------------------------------------
| Remember Driver Refresh Session
|--------------------------------------------------------------------------
| Same driver ke multiple legitimate browser/device logins ko preserve karta
| hai. Raw token nahi, sirf SHA-256 hash stored hota hai. Latest 10 sessions.
|--------------------------------------------------------------------------
*/
const buildRefreshSessionHashes = async (
  userId,
  newRefreshTokenHash
) => {
  const cleanNewHash =
    String(
      newRefreshTokenHash || ""
    ).trim();

  if (!userId || !cleanNewHash) {
    return [];
  }

  /*
  | Existing single-hash session ko NAYE login se pehle read karo. Isse
  | deployment ke time already logged-in device bhi preserve ho sakta hai.
  */
  const tokenState =
    await User.findById(
      userId
    )
      .select(
        "+refreshTokenHash +refreshTokenHashes"
      )
      .lean();

  const existingHashes =
    Array.isArray(
      tokenState?.refreshTokenHashes
    )
      ? tokenState.refreshTokenHashes
      : [];

  return Array.from(
    new Set(
      [
        ...existingHashes,
        tokenState?.refreshTokenHash,
        cleanNewHash
      ]
        .map((value) =>
          String(value || "").trim()
        )
        .filter(Boolean)
    )
  ).slice(-10);
};
const sendDriverOtp = async (
  req,
  res
) => {
  const {
    phone
  } = validateDriverSendOtp(
    req.body
  );

  const existingCustomer =
    await User.findOne({
      phone,
      role: "customer"
    });

  if (existingCustomer) {
    throw new ApiError(
      409,
      "This phone number is already registered as a customer"
    );
  }

  const existingOtp =
    await Otp.findOne({
      phone,
      purpose:
        OTP.PURPOSES.DRIVER_LOGIN,
      verified: false,
      expiresAt: {
        $gt: new Date()
      }
    }).sort({
      createdAt: -1
    });

  if (existingOtp) {
    const secondsSinceLastSend =
      Math.floor(
        (
          Date.now() -
          new Date(
            existingOtp.lastSentAt
          ).getTime()
        ) / 1000
      );

    const remainingCooldown =
      OTP.RESEND_COOLDOWN_SECONDS -
      secondsSinceLastSend;

    if (remainingCooldown > 0) {
      throw new ApiError(
        429,
        `Please wait ${remainingCooldown} seconds before requesting another OTP`
      );
    }

    if (
      existingOtp.resendCount >=
      OTP.MAX_RESENDS
    ) {
      throw new ApiError(
        429,
        "Maximum OTP resend limit reached. Please try again later."
      );
    }
  }

  const plainOtp = generateOtp();

  await Otp.deleteMany({
    phone,
    purpose:
      OTP.PURPOSES.DRIVER_LOGIN
  });

  await Otp.create({
    phone,
    purpose:
      OTP.PURPOSES.DRIVER_LOGIN,
    otpHash: hashOtp(plainOtp),
    expiresAt: getExpiryTime(),
    attempts: 0,
    maxAttempts:
      OTP.MAX_ATTEMPTS,
    resendCount: existingOtp
      ? existingOtp.resendCount + 1
      : 0,
    lastSentAt: new Date(),
    ipAddress: getRequestIp(req),
    userAgent:
      req.get("user-agent") || ""
  });

  const responseData = {
    phone,
    expiresInMinutes:
      OTP.EXPIRY_MINUTES,
    resendAfterSeconds:
      OTP.RESEND_COOLDOWN_SECONDS
  };

  /*
  |--------------------------------------------------------------------------
  | SMS OTP Delivery
  |--------------------------------------------------------------------------
  | OTP DB mein save ho gayi — ab driver ke phone pe bhejo.
  | Fail hone par bhi request continue rahegi (non-blocking).
  */

  const smsResult = await sendOtpSms(phone, plainOtp);

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    responseData.developmentOtp =
      plainOtp;
  }

  if (!smsResult.sent && process.env.NODE_ENV === "production") {
    console.error(
      `[DriverAuth] SMS delivery failed for ${phone}: ${smsResult.error || "disabled"}`
    );

    return res.status(503).json({
      success: false,
      message:
        "Driver OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein."
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "Driver OTP sent successfully"
    )
  );
};

const verifyDriverOtp = async (
  req,
  res
) => {
  const {
    phone,
    otp,
    name
  } = validateDriverVerifyOtp(
    req.body
  );

  const otpRecord =
    await Otp.findOne({
      phone,
      purpose:
        OTP.PURPOSES.DRIVER_LOGIN,
      verified: false
    })
      .sort({
        createdAt: -1
      })
      .select("+otpHash");

  if (!otpRecord) {
    throw new ApiError(
      400,
      "OTP not found or already used"
    );
  }

  if (
    isExpired(
      otpRecord.expiresAt
    )
  ) {
    await Otp.deleteOne({
      _id: otpRecord._id
    });

    throw new ApiError(
      400,
      "OTP has expired. Please request a new OTP."
    );
  }

  if (
    otpRecord.attempts >=
    otpRecord.maxAttempts
  ) {
    await Otp.deleteOne({
      _id: otpRecord._id
    });

    throw new ApiError(
      429,
      "Maximum OTP attempts reached. Please request a new OTP."
    );
  }

  const isOtpValid = verifyOtp(
    otp,
    otpRecord.otpHash
  );

  if (!isOtpValid) {
    otpRecord.attempts += 1;

    await otpRecord.save();

    const remainingAttempts =
      otpRecord.maxAttempts -
      otpRecord.attempts;

    throw new ApiError(
      400,
      `Invalid OTP. ${remainingAttempts} attempts remaining.`
    );
  }

  const existingCustomer =
    await User.findOne({
      phone,
      role: "customer"
    });

  if (existingCustomer) {
    throw new ApiError(
      409,
      "This phone number is already registered as a customer"
    );
  }

  let user = await User.findOne({
    phone,
    role: "driver"
  });

  const isNewUser = !user;

  if (!user) {
    user = await User.create({
      role: "driver",
      name,
      phone,
      isPhoneVerified: true,
      isOnline: false,
      isAvailable: false,
      lastLoginAt: new Date(),
      driverProfile: {
        approvalStatus:
          "not_submitted",
        isApproved: false
      }
    });
  } else {
    if (!user.isActive) {
      throw new ApiError(
        403,
        "Your account is inactive"
      );
    }

    if (
      user.accountStatus !==
      "active"
    ) {
      throw new ApiError(
        403,
        `Driver account is ${user.accountStatus}`
      );
    }

    if (!user.name && name) {
      user.name = name;
    }

    user.isPhoneVerified = true;
    user.lastLoginAt =
      new Date();
  }

  const {
    accessToken,
    refreshToken,
    refreshTokenHash
  } = generateAuthTokens(user);

  const refreshTokenHashes =
    await buildRefreshSessionHashes(
      user._id,
      refreshTokenHash
    );

  user.refreshTokenHash =
    refreshTokenHash;

  user.refreshTokenHashes =
    refreshTokenHashes;

  await user.save();

  otpRecord.verified = true;
  otpRecord.verifiedAt =
    new Date();

  await otpRecord.save();

  await Otp.deleteMany({
    phone,
    purpose:
      OTP.PURPOSES.DRIVER_LOGIN
  });

  setRefreshTokenCookie(
    res,
    refreshToken
  );

  res.status(
    isNewUser ? 201 : 200
  ).json(
    new ApiResponse(
      isNewUser ? 201 : 200,
      {
        isNewUser,
        accessToken,
        user: user.toSafeObject()
      },
      isNewUser
        ? "Driver account created successfully"
        : "Driver login successful"
    )
  );
};

module.exports = {
  sendDriverOtp,
  verifyDriverOtp
};