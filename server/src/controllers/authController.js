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

const setRefreshTokenCookie = (
  res,
  refreshToken
) => {
  const isProduction =
    process.env.NODE_ENV ===
    "production";

  res.cookie(
    "refreshToken",
    refreshToken,
    {
      httpOnly: true,

      secure:
        process.env
          .COOKIE_SECURE ===
          "true" ||
        isProduction,

      sameSite:
        process.env
          .COOKIE_SAME_SITE ||
        "lax",

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

  return safeUser;
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
      console.warn(
        `[Auth] SMS delivery failed for ${phone}: ${
          smsResult.error ||
          "disabled"
        }`
      );
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

    user
      .refreshTokenHash =
      refreshTokenHash;

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
          "+refreshTokenHash"
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

    if (
      !user
        .refreshTokenHash
    ) {
      throw new ApiError(
        401,
        "Session nahi mili. Dobara login karo."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Compare Refresh Token Hash
    |--------------------------------------------------------------------------
    */

    const incomingHash =
      hashToken(
        incomingToken
      );

    if (
      user
        .refreshTokenHash !==
      incomingHash
    ) {
      /*
      |--------------------------------------------------------------------------
      | Possible Reused / Invalid Session
      |--------------------------------------------------------------------------
      */

      user
        .refreshTokenHash =
        null;

      await user.save();

      throw new ApiError(
        401,
        "Session invalid ho gayi. Dobara login karo."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Rotate Tokens
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

    user
      .refreshTokenHash =
      refreshTokenHash;

    user.lastLoginAt =
      new Date();

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | New Refresh Cookie
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
      .status(200)
      .json({
        success: true,

        message:
          "Session refresh ho gayi",

        data: {
          accessToken,

          token:
            accessToken,

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
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  sendCustomerOtp,
  verifyCustomerOtp,
  refreshAccessToken,
  updateCustomerProfile
};