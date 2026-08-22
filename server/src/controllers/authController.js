const Otp = require("../models/Otp");
const User = require("../models/User");

const OTP = require("../constants/otp");

const ApiError = require(
  "../utils/ApiError"
);

const ApiResponse = require(
  "../utils/ApiResponse"
);

const {
  generateOtp,
  hashOtp,
  verifyOtp,
  getExpiryTime,
  isExpired
} = require(
  "../services/otpService"
);

const {
  sendOtpSms
} = require(
  "../services/smsService"
);

const {
  generateAuthTokens,
  createAccessToken,
  verifyRefreshToken,
  hashToken
} = require(
  "../services/tokenService"
);

const {
  validateSendOtp,
  validateVerifyOtp,
  validatePhone
} = require(
  "../validators/authValidator"
);


/*
|--------------------------------------------------------------------------
| Native Mobile Client Detection
|--------------------------------------------------------------------------
| Browser keeps refresh token httpOnly-only. The native app identifies itself
| with X-HimRideG-Client: mobile and may store the refresh token in SecureStore.
|--------------------------------------------------------------------------
*/

const shouldReturnMobileRefreshToken = (req) =>
  String(
    req.headers?.["x-himrideg-client"] || ""
  )
    .trim()
    .toLowerCase() === "mobile";

/*
|--------------------------------------------------------------------------
| Request IP
|--------------------------------------------------------------------------
*/

const getRequestIp = (
  req
) => {
  return (
    req.headers[
      "x-forwarded-for"
    ]
      ?.split(",")[0]
      ?.trim() ||
    req.socket
      .remoteAddress ||
    ""
  );
};

/*
|--------------------------------------------------------------------------
| Refresh Token Cookie
|--------------------------------------------------------------------------
*/

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

  /*
  |--------------------------------------------------------------------------
  | Production Cookie Default
  |--------------------------------------------------------------------------
  |
  | Frontend himrideg.com aur API api.himrideg.com alag origins hain.
  | Secure + SameSite=None cross-origin credential requests ke liye sabse
  | compatible production default hai. Local development me lax rakhenge.
  |
  */

  return isProduction
    ? "none"
    : "lax";
};

const setRefreshTokenCookie = (
  res,
  refreshToken
) => {
  const isProduction =
    process.env.NODE_ENV ===
    "production";

  const secureCookie =
    process.env
      .COOKIE_SECURE ===
      "true" ||
    isProduction;

  const sameSite =
    normalizeSameSite(
      process.env
        .COOKIE_SAME_SITE,
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
        7 *
        24 *
        60 *
        60 *
        1000
    }
  );
};

/*
|--------------------------------------------------------------------------
| Safe User Object
|--------------------------------------------------------------------------
|
| refreshTokenHash kabhi frontend ko nahi bhejna.
|
*/

const toSafeUserObject = (
  user
) => {
  const safeUser =
    user.toSafeObject();

  delete safeUser
    .refreshTokenHash;

  delete safeUser
    .refreshTokenHashes;

  return safeUser;
};

/*
|--------------------------------------------------------------------------
| Remember Refresh Session
|--------------------------------------------------------------------------
|
| HimRideG website ek hi customer/driver account ko laptop, phone ya doosre
| browser me legitimately use kar sakti hai. Purane single hash behavior me
| har naya login previous device ka refresh session replace kar deta tha.
| Access token expire hote hi /auth/refresh par "Session token match nahi
| hua" aata tha aur payment create-order 401 fail ho jata tha.
|
| Raw refresh token store nahi hota. Sirf SHA-256 hash remember hota hai.
| Latest 10 session hashes hi preserve kiye jaate hain.
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
/*
|--------------------------------------------------------------------------
| Optional Email Validation
|--------------------------------------------------------------------------
*/

const normalizeOptionalEmail = (
  email
) => {
  const value =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();

  if (!value) {
    return "";
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(
      value
    )
  ) {
    throw new ApiError(
      400,
      "Please enter a valid email address"
    );
  }

  if (
    value.length > 150
  ) {
    throw new ApiError(
      400,
      "Email cannot exceed 150 characters"
    );
  }

  return value;
};

/*
|--------------------------------------------------------------------------
| Customer Profile Image
|--------------------------------------------------------------------------
*/

const normalizeOptionalProfileImage =
  (
    profileImage
  ) => {
    const value =
      String(
        profileImage || ""
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | Dashboard resized base64 image ya normal URL bhej sakta hai.
    |--------------------------------------------------------------------------
    */

    if (
      value.length >
      1500000
    ) {
      throw new ApiError(
        400,
        "Profile image is too large"
      );
    }

    return value;
  };

/*
|--------------------------------------------------------------------------
| Send Customer OTP
|--------------------------------------------------------------------------
*/

const sendCustomerOtp =
  async (
    req,
    res
  ) => {
    const {
      phone
    } =
      validateSendOtp(
        req.body
      );

    /*
    |--------------------------------------------------------------------------
    | Same Phone Driver Account Check
    |--------------------------------------------------------------------------
    */

    const existingDriver =
      await User.findOne({
        phone,
        role: "driver"
      });

    if (
      existingDriver
    ) {
      throw new ApiError(
        409,
        "This phone number is already registered as a driver"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Existing OTP
    |--------------------------------------------------------------------------
    */

    const existingOtp =
      await Otp.findOne({
        phone,

        purpose:
          OTP.PURPOSES
            .CUSTOMER_LOGIN,

        verified: false,

        expiresAt: {
          $gt:
            new Date()
        }
      }).sort({
        createdAt: -1
      });

    /*
    |--------------------------------------------------------------------------
    | OTP Cooldown / Resend Limit
    |--------------------------------------------------------------------------
    */

    if (
      existingOtp
    ) {
      const secondsSinceLastSend =
        Math.floor(
          (
            Date.now() -
            new Date(
              existingOtp
                .lastSentAt
            ).getTime()
          ) /
            1000
        );

      const remainingCooldown =
        OTP
          .RESEND_COOLDOWN_SECONDS -
        secondsSinceLastSend;

      if (
        remainingCooldown >
        0
      ) {
        throw new ApiError(
          429,
          `Please wait ${remainingCooldown} seconds before requesting another OTP`
        );
      }

      if (
        existingOtp
          .resendCount >=
        OTP.MAX_RESENDS
      ) {
        throw new ApiError(
          429,
          "Maximum OTP resend limit reached. Please try again later."
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate OTP
    |--------------------------------------------------------------------------
    */

    const plainOtp =
      generateOtp();

    /*
    |--------------------------------------------------------------------------
    | Remove Previous Customer OTP
    |--------------------------------------------------------------------------
    */

    await Otp.deleteMany({
      phone,

      purpose:
        OTP.PURPOSES
          .CUSTOMER_LOGIN
    });

    /*
    |--------------------------------------------------------------------------
    | Save New OTP
    |--------------------------------------------------------------------------
    */

    await Otp.create({
      phone,

      purpose:
        OTP.PURPOSES
          .CUSTOMER_LOGIN,

      otpHash:
        hashOtp(
          plainOtp
        ),

      expiresAt:
        getExpiryTime(),

      attempts: 0,

      maxAttempts:
        OTP.MAX_ATTEMPTS,

      resendCount:
        existingOtp
          ? existingOtp
              .resendCount +
            1
          : 0,

      lastSentAt:
        new Date(),

      ipAddress:
        getRequestIp(
          req
        ),

      userAgent:
        req.get(
          "user-agent"
        ) || ""
    });

    /*
    |--------------------------------------------------------------------------
    | Response Data
    |--------------------------------------------------------------------------
    */

    const responseData = {
      phone,

      expiresInMinutes:
        OTP
          .EXPIRY_MINUTES,

      resendAfterSeconds:
        OTP
          .RESEND_COOLDOWN_SECONDS
    };

    /*
    |--------------------------------------------------------------------------
    | Send SMS
    |--------------------------------------------------------------------------
    */

    const smsResult =
      await sendOtpSms(
        phone,
        plainOtp
      );

    /*
    |--------------------------------------------------------------------------
    | Development OTP
    |--------------------------------------------------------------------------
    |
    | Development mode me OTP screen par mil sakegi.
    |
    */

    if (
      process.env
        .NODE_ENV ===
      "development"
    ) {
      responseData
        .developmentOtp =
        plainOtp;
    }

    /*
    |--------------------------------------------------------------------------
    | Production SMS Warning
    |--------------------------------------------------------------------------
    */

    if (
      !smsResult.sent &&
      process.env
        .NODE_ENV ===
        "production"
    ) {
      console.error(
        `[Auth] SMS delivery failed for ${phone}: ${
          smsResult.error ||
          "disabled"
        }`
      );

      return res
        .status(503)
        .json({
          success: false,
          message:
            "OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Success Response
    |--------------------------------------------------------------------------
    */

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          "OTP sent successfully"
        )
      );
  };

/*
|--------------------------------------------------------------------------
| Verify Customer OTP
|--------------------------------------------------------------------------
*/

const verifyCustomerOtp =
  async (
    req,
    res
  ) => {
    const {
      phone,
      otp,
      name
    } =
      validateVerifyOtp(
        req.body
      );

    /*
    |--------------------------------------------------------------------------
    | Find OTP
    |--------------------------------------------------------------------------
    */

    const otpRecord =
      await Otp.findOne({
        phone,

        purpose:
          OTP.PURPOSES
            .CUSTOMER_LOGIN,

        verified: false
      })
        .sort({
          createdAt: -1
        })
        .select(
          "+otpHash"
        );

    if (
      !otpRecord
    ) {
      throw new ApiError(
        400,
        "OTP not found or already used"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Expired OTP
    |--------------------------------------------------------------------------
    */

    if (
      isExpired(
        otpRecord
          .expiresAt
      )
    ) {
      await Otp.deleteOne({
        _id:
          otpRecord._id
      });

      throw new ApiError(
        400,
        "OTP has expired. Please request a new OTP."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Maximum Attempts
    |--------------------------------------------------------------------------
    */

    if (
      otpRecord
        .attempts >=
      otpRecord
        .maxAttempts
    ) {
      await Otp.deleteOne({
        _id:
          otpRecord._id
      });

      throw new ApiError(
        429,
        "Maximum OTP attempts reached. Please request a new OTP."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify OTP
    |--------------------------------------------------------------------------
    */

    const isOtpValid =
      verifyOtp(
        otp,
        otpRecord
          .otpHash
      );

    if (
      !isOtpValid
    ) {
      otpRecord
        .attempts += 1;

      await otpRecord.save();

      const remainingAttempts =
        otpRecord
          .maxAttempts -
        otpRecord
          .attempts;

      throw new ApiError(
        400,
        `Invalid OTP. ${remainingAttempts} attempts remaining.`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Customer
    |--------------------------------------------------------------------------
    */

    let user =
      await User.findOne({
        phone,
        role:
          "customer"
      });

    const isNewUser =
      !user;

    /*
    |--------------------------------------------------------------------------
    | New Customer Name Required
    |--------------------------------------------------------------------------
    */

    if (
      isNewUser &&
      !name
    ) {
      throw new ApiError(
        400,
        "Name is required for first-time registration"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Customer
    |--------------------------------------------------------------------------
    */

    if (!user) {
      user =
        await User.create({
          role:
            "customer",

          name,

          phone,

          isPhoneVerified:
            true,

          lastLoginAt:
            new Date()
        });
    } else {
      /*
      |--------------------------------------------------------------------------
      | Blocked
      |--------------------------------------------------------------------------
      */

      if (
        user
          .accountStatus ===
        "blocked"
      ) {
        throw new ApiError(
          403,
          user
            .blockReason ||
            "Your account has been blocked"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Suspended / Deleted
      |--------------------------------------------------------------------------
      */

      if (
        user
          .accountStatus ===
          "suspended" ||
        user
          .accountStatus ===
          "deleted"
      ) {
        throw new ApiError(
          403,
          `Your account is ${user.accountStatus}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Inactive
      |--------------------------------------------------------------------------
      */

      if (
        user.isActive ===
          false ||
        user
          .accountStatus ===
          "inactive"
      ) {
        throw new ApiError(
          403,
          "Your account is inactive"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Update Missing Name
      |--------------------------------------------------------------------------
      */

      if (
        !user.name &&
        name
      ) {
        user.name =
          name;
      }

      user
        .isPhoneVerified =
        true;

      user.lastLoginAt =
        new Date();
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Tokens
    |--------------------------------------------------------------------------
    */

    const {
      accessToken,
      refreshToken,
      refreshTokenHash
    } =
      generateAuthTokens(
        user
      );

    /*
    |--------------------------------------------------------------------------
    | Save Refresh Token Hash
    |--------------------------------------------------------------------------
    */

    const refreshTokenHashes =
      await buildRefreshSessionHashes(
        user._id,
        refreshTokenHash
      );

    user
      .refreshTokenHash =
      refreshTokenHash;

    user.refreshTokenHashes =
      refreshTokenHashes;

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | Mark OTP Verified
    |--------------------------------------------------------------------------
    */

    otpRecord.verified =
      true;

    otpRecord.verifiedAt =
      new Date();

    await otpRecord.save();

    /*
    |--------------------------------------------------------------------------
    | Remove Used OTP
    |--------------------------------------------------------------------------
    */

    await Otp.deleteMany({
      phone,

      purpose:
        OTP.PURPOSES
          .CUSTOMER_LOGIN
    });

    /*
    |--------------------------------------------------------------------------
    | Set Refresh Cookie
    |--------------------------------------------------------------------------
    */

    setRefreshTokenCookie(
      res,
      refreshToken
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res
      .status(
        isNewUser
          ? 201
          : 200
      )
      .json(
        new ApiResponse(
          isNewUser
            ? 201
            : 200,

          {
            isNewUser,

            accessToken,

            ...(shouldReturnMobileRefreshToken(req)
              ? { refreshToken }
              : {}),

            user:
              toSafeUserObject(
                user
              )
          },

          isNewUser
            ? "Customer account created and login successful"
            : "Login successful"
        )
      );
  };

/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
|
| Customer aur Driver dono ke liye same refresh endpoint.
|
*/

const refreshAccessToken =
  async (
    req,
    res
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Get Refresh Token
    |--------------------------------------------------------------------------
    */

    const incomingToken =
      req.cookies
        ?.refreshToken ||
      req.body
        ?.refreshToken ||
      "";

    if (
      !incomingToken
    ) {
      throw new ApiError(
        401,
        "Refresh token nahi mila. Dobara login karo."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Refresh Token
    |--------------------------------------------------------------------------
    */

    let payload;

    try {
      payload =
        verifyRefreshToken(
          incomingToken
        );
    } catch (
      error
    ) {
      throw new ApiError(
        401,
        "Refresh token invalid ya expire ho gaya. Dobara login karo."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check Token Type
    |--------------------------------------------------------------------------
    */

    if (
      payload?.type !==
      "refresh"
    ) {
      throw new ApiError(
        401,
        "Galat token type."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    const user =
      await User
        .findById(
          payload.sub
        )
        .select(
          "+refreshTokenHash +refreshTokenHashes"
        );

    if (!user) {
      throw new ApiError(
        401,
        "User nahi mila."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Account Status
    |--------------------------------------------------------------------------
    */

    if (
      user.isActive ===
        false ||
      user
        .accountStatus ===
        "inactive" ||
      user
        .accountStatus ===
        "blocked" ||
      user
        .accountStatus ===
        "suspended" ||
      user
        .accountStatus ===
        "deleted"
    ) {
      throw new ApiError(
        403,
        "Account active nahi hai. Admin se sampark karo."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Stored Refresh Hash
    |--------------------------------------------------------------------------
    */

    const rememberedRefreshHashes =
      Array.isArray(
        user.refreshTokenHashes
      )
        ? user.refreshTokenHashes
            .map((value) =>
              String(value || "").trim()
            )
            .filter(Boolean)
        : [];

    if (
      !user.refreshTokenHash &&
      rememberedRefreshHashes.length === 0
    ) {
      throw new ApiError(
        401,
        "Session nahi mili. Dobara login karo."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Compare Refresh Token Hash — Multi Session Safe
    |--------------------------------------------------------------------------
    */

    const incomingHash =
      hashToken(
        incomingToken
      );

    const matchesLegacyHash =
      String(
        user.refreshTokenHash || ""
      ) === incomingHash;

    const matchesRememberedSession =
      rememberedRefreshHashes.includes(
        incomingHash
      );

    if (
      !matchesLegacyHash &&
      !matchesRememberedSession
    ) {
      /*
      |--------------------------------------------------------------------------
      | Unknown / Revoked Refresh Token
      |--------------------------------------------------------------------------
      |
      | Security weaken nahi karni: sirf valid JWT hona enough nahi hai. Token
      | ka hash user ke remembered active sessions me bhi hona chahiye.
      |--------------------------------------------------------------------------
      */

      throw new ApiError(
        401,
        "Session token match nahi hua. Ek baar dobara login karo; uske baad multi-device session preserve rahega."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Legacy Session Migration
    |--------------------------------------------------------------------------
    |
    | Old deployment ka current single hash agar valid hai to use remembered
    | sessions array me migrate kar do. Iske baad next login ise replace nahi
    | karega.
    |--------------------------------------------------------------------------
    */

    if (
      matchesLegacyHash &&
      !matchesRememberedSession
    ) {
      user.refreshTokenHashes = [
        ...rememberedRefreshHashes,
        incomingHash
      ].slice(-10);
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh Access Token Without Refresh-Token Rotation
    |--------------------------------------------------------------------------
    |
    | Access token refresh par same refresh token ko rotate na karna deliberate
    | hai. Multiple tabs / simultaneous protected requests agar ek hi expired
    | access token ke baad refresh karein, token rotation race create kar sakti
    | thi: first request DB hash badal deti thi aur second request old cookie se
    | mismatch karke session invalidate kar deti thi.
    |
    | Login/OTP verification par fresh refresh token ab bhi generate hota hai.
    | Yahan sirf naya short-lived access token issue hota hai.
    |
    */

    const accessToken =
      createAccessToken(
        user
      );

    user.lastLoginAt =
      new Date();

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | Re-Apply Current Refresh Cookie Attributes
    |--------------------------------------------------------------------------
    |
    | Existing valid token ko hi cookie me dubara set karte hain taaki deployed
    | cookie attributes (Secure/SameSite/Path) browser me consistently apply hon.
    | JWT ki own expiry verifyRefreshToken se enforce hoti rahegi.
    |
    */

    setRefreshTokenCookie(
      res,
      incomingToken
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Session refresh ho gayi",

        data: {
          accessToken,

          token:
            accessToken,

          ...(shouldReturnMobileRefreshToken(req)
            ? { refreshToken: incomingToken }
            : {}),

          user:
            toSafeUserObject(
              user
            )
        }
      });
  };

/*
|--------------------------------------------------------------------------
| Update Customer Profile
|--------------------------------------------------------------------------
*/

const updateCustomerProfile =
  async (
    req,
    res
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Logged-in User
    |--------------------------------------------------------------------------
    */

    const user =
      req.user;

    if (!user) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Customer Only
    |--------------------------------------------------------------------------
    */

    if (
      user.role !==
      "customer"
    ) {
      throw new ApiError(
        403,
        "Only customer can update customer profile"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    const name =
      String(
        req.body
          ?.name ||
          ""
      ).trim();

    if (
      name.length < 2
    ) {
      throw new ApiError(
        400,
        "Name must contain at least 2 characters"
      );
    }

    if (
      name.length >
      100
    ) {
      throw new ApiError(
        400,
        "Name cannot exceed 100 characters"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Alternative Phone
    |--------------------------------------------------------------------------
    */

    const alternativePhoneRaw =
      String(
        req.body
          ?.alternativePhone ||
          ""
      ).trim();

    let alternativePhone =
      "";

    if (
      alternativePhoneRaw
    ) {
      alternativePhone =
        validatePhone(
          alternativePhoneRaw
        );

      if (
        alternativePhone ===
        user.phone
      ) {
        throw new ApiError(
          400,
          "Alternative phone primary phone se alag hona chahiye"
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */

    const email =
      normalizeOptionalEmail(
        req.body?.email
      );

    /*
    |--------------------------------------------------------------------------
    | Profile Image
    |--------------------------------------------------------------------------
    */

    const profileImage =
      normalizeOptionalProfileImage(
        req.body
          ?.profileImage
      );

    /*
    |--------------------------------------------------------------------------
    | Update Fields
    |--------------------------------------------------------------------------
    */

    user.name =
      name;

    user.alternativePhone =
      alternativePhone;

    user.email =
      email ||
      undefined;

    user.profileImage =
      profileImage;

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,

          {
            user:
              toSafeUserObject(
                user
              )
          },

          "Profile successfully update ho gayi"
        )
      );
  };

/*
|--------------------------------------------------------------------------
| Current Authenticated App User — Mobile + Website Compatibility
|--------------------------------------------------------------------------
| GET /api/v2/auth/me
|
| Customer/driver app ko same website backend se fresh safe profile milta hai.
|--------------------------------------------------------------------------
*/

const getCurrentAuthenticatedUser =
  async (
    req,
    res
  ) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user:
              toSafeUserObject(
                req.user
              )
          },
          "Current account fetched"
        )
      );
  };

/*
|--------------------------------------------------------------------------
| Account Preferences — Mobile + Website
|--------------------------------------------------------------------------
| GET/PATCH /api/v2/auth/preferences
|
| Preferences are intentionally small and non-sensitive. Payment credentials,
| UPI PINs, bank secrets or card details are never stored here.
|--------------------------------------------------------------------------
*/

const normalizeAccountPreferences = (value = {}) => {
  const theme =
    String(value?.theme || "dark").toLowerCase() === "light"
      ? "light"
      : "dark";

  const preferredUpiApp =
    String(value?.preferredUpiApp || "any").toLowerCase() === "paytm"
      ? "paytm"
      : "any";

  return {
    theme,
    preferredUpiApp,
    betaFeatures: Boolean(value?.betaFeatures),
    updatedAt: value?.updatedAt || null
  };
};

const getAccountPreferences =
  async (
    req,
    res
  ) => {
    const user = req.user;

    if (!user) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            preferences:
              normalizeAccountPreferences(
                user.appPreferences || {}
              )
          },
          "Account preferences fetched"
        )
      );
  };

const updateAccountPreferences =
  async (
    req,
    res
  ) => {
    const user = req.user;

    if (!user) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    const current =
      normalizeAccountPreferences(
        user.appPreferences || {}
      );

    const next = {
      ...current
    };

    if (
      Object.prototype.hasOwnProperty.call(
        req.body || {},
        "theme"
      )
    ) {
      const incomingTheme =
        String(req.body?.theme || "")
          .trim()
          .toLowerCase();

      if (
        ![
          "dark",
          "light"
        ].includes(incomingTheme)
      ) {
        throw new ApiError(
          400,
          "Theme dark ya light hona chahiye"
        );
      }

      next.theme =
        incomingTheme;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body || {},
        "preferredUpiApp"
      )
    ) {
      const incomingUpi =
        String(
          req.body?.preferredUpiApp || ""
        )
          .trim()
          .toLowerCase();

      if (
        ![
          "any",
          "paytm"
        ].includes(incomingUpi)
      ) {
        throw new ApiError(
          400,
          "Preferred UPI app any ya paytm hona chahiye"
        );
      }

      next.preferredUpiApp =
        incomingUpi;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body || {},
        "betaFeatures"
      )
    ) {
      next.betaFeatures =
        Boolean(
          req.body?.betaFeatures
        );
    }

    next.updatedAt =
      new Date();

    user.appPreferences =
      next;

    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            preferences:
              normalizeAccountPreferences(
                user.appPreferences || {}
              )
          },
          "Account preferences saved"
        )
      );
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  sendCustomerOtp,
  verifyCustomerOtp,
  refreshAccessToken,
  updateCustomerProfile,
  getCurrentAuthenticatedUser,
  getAccountPreferences,
  updateAccountPreferences
};