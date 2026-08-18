const User = require(
  "../models/User"
);

const ApiError = require(
  "../utils/ApiError"
);

const ApiResponse = require(
  "../utils/ApiResponse"
);

const {
  generateAuthTokens
} = require(
  "../services/tokenService"
);

const {
  verifyGoogleIdToken
} = require(
  "../services/googleIdTokenService"
);

const text = (value) =>
  String(value || "").trim();

const normalizeRole = (
  role
) => {
  const value =
    text(role)
      .toLowerCase();

  if (
    value !== "customer" &&
    value !== "driver"
  ) {
    throw new ApiError(
      400,
      "Google login sirf Customer ya Driver ke liye available hai"
    );
  }

  return value;
};

const normalizePhone = (
  phone,
  {
    required = false
  } = {}
) => {
  const digits =
    text(phone)
      .replace(/\D/g, "")
      .slice(-10);

  if (!digits) {
    if (required) {
      throw new ApiError(
        400,
        "First Google signup ke liye mobile number required hai",
        [],
        "GOOGLE_PHONE_REQUIRED"
      );
    }

    return "";
  }

  if (
    !/^[6-9]\d{9}$/.test(
      digits
    )
  ) {
    throw new ApiError(
      400,
      "Valid 10 digit Indian mobile number enter karo"
    );
  }

  return digits;
};

const normalizeSameSite = (
  value,
  isProduction
) => {
  const requested =
    text(value)
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

const toSafeUserObject = (
  user
) => {
  const safeUser =
    user.toSafeObject();

  delete safeUser
    .refreshTokenHash;

  return safeUser;
};

const assertAccountCanLogin = (
  user
) => {
  if (!user) {
    return;
  }

  if (
    user.accountStatus ===
      "blocked"
  ) {
    throw new ApiError(
      403,
      user.blockReason ||
        "Your account has been blocked"
    );
  }

  if (
    user.accountStatus ===
      "suspended" ||
    user.accountStatus ===
      "deleted"
  ) {
    throw new ApiError(
      403,
      `Your account is ${user.accountStatus}`
    );
  }

  if (
    user.isActive === false ||
    user.accountStatus ===
      "inactive"
  ) {
    throw new ApiError(
      403,
      "Your account is inactive"
    );
  }
};

const saveGoogleProfile = (
  user,
  googleProfile
) => {
  if (
    !user.name &&
    googleProfile.name
  ) {
    user.name =
      googleProfile.name;
  }

  user.googleId =
    googleProfile.googleId;

  user.googleEmail =
    googleProfile.email;

  user.googleLinkedAt =
    user.googleLinkedAt ||
    new Date();

  if (
    !user.email ||
    user.email ===
      googleProfile.email ||
    googleProfile
      .isGoogleAuthoritativeEmail
  ) {
    user.email =
      googleProfile.email;

    user.isEmailVerified =
      true;
  }

  if (
    !user.profileImage &&
    googleProfile.picture
  ) {
    user.profileImage =
      googleProfile.picture;
  }

  user.lastLoginAt =
    new Date();

  user.lastSeenAt =
    new Date();
};

const findExistingByGoogle =
  async (
    googleId,
    role
  ) => {
    return User.findOne({
      googleId,
      role
    });
  };

const findSafeEmailMatch =
  async (
    googleProfile,
    role
  ) => {
    if (
      !googleProfile
        .isGoogleAuthoritativeEmail
    ) {
      return null;
    }

    const matches =
      await User.find({
        email:
          googleProfile.email,
        role
      }).limit(2);

    if (
      matches.length === 1
    ) {
      return matches[0];
    }

    return null;
  };

const findPhoneOwner =
  async (
    phone
  ) => {
    if (!phone) {
      return null;
    }

    return User.findOne({
      phone
    });
  };

const createGoogleUser =
  async ({
    googleProfile,
    role,
    phone
  }) => {
    const baseUser = {
      role,
      name:
        googleProfile.name ||
        (
          role === "driver"
            ? "HimRideG Driver"
            : "HimRideG Customer"
        ),
      phone,
      email:
        googleProfile.email,
      googleEmail:
        googleProfile.email,
      googleId:
        googleProfile.googleId,
      googleLinkedAt:
        new Date(),
      isEmailVerified:
        true,
      isPhoneVerified:
        false,
      profileImage:
        googleProfile.picture ||
        "",
      lastLoginAt:
        new Date(),
      lastSeenAt:
        new Date()
    };

    if (
      role === "driver"
    ) {
      baseUser.isOnline =
        false;

      baseUser.isAvailable =
        false;

      baseUser.driverProfile = {
        approvalStatus:
          "not_submitted",
        isApproved:
          false
      };
    }

    return User.create(
      baseUser
    );
  };

const googleLogin =
  async (
    req,
    res
  ) => {
    const role =
      normalizeRole(
        req.body?.role
      );

    let googleProfile;

    try {
      googleProfile =
        await verifyGoogleIdToken(
          req.body?.credential
        );
    } catch (error) {
      console.error(
        "[GoogleAuth] ID token verification failed:",
        error.message
      );

      throw new ApiError(
        401,
        "Google sign-in verify nahi ho paya. Dobara Google account select karo."
      );
    }

    let user =
      await findExistingByGoogle(
        googleProfile.googleId,
        role
      );

    let isNewUser =
      false;

    let linkedExistingUser =
      false;

    if (!user) {
      user =
        await findSafeEmailMatch(
          googleProfile,
          role
        );

      if (user) {
        if (
          user.googleId &&
          user.googleId !==
            googleProfile.googleId
        ) {
          throw new ApiError(
            409,
            "Is HimRideG account ke saath doosra Google account linked hai"
          );
        }

        linkedExistingUser =
          true;
      }
    }

    if (!user) {
      const phone =
        normalizePhone(
          req.body?.phone
        );

      if (!phone) {
        return res
          .status(409)
          .json({
            success: false,
            code:
              "GOOGLE_PHONE_REQUIRED",
            requiresPhone:
              true,
            message:
              "First Google signup ke liye mobile number enter karo. OTP nahi lagega."
          });
      }

      const phoneOwner =
        await findPhoneOwner(
          phone
        );

      if (phoneOwner) {
        if (
          phoneOwner.role !==
          role
        ) {
          throw new ApiError(
            409,
            `Ye mobile number pehle se ${phoneOwner.role} account me registered hai`
          );
        }

        if (
          phoneOwner.googleId ===
          googleProfile.googleId
        ) {
          user =
            phoneOwner;
        } else if (
          phoneOwner.email &&
          phoneOwner.email
            .toLowerCase() ===
            googleProfile.email &&
          googleProfile
            .isGoogleAuthoritativeEmail
        ) {
          user =
            phoneOwner;

          linkedExistingUser =
            true;
        } else {
          return res
            .status(409)
            .json({
              success: false,
              code:
                "GOOGLE_EXISTING_ACCOUNT_LINK_REQUIRED",
              requiresExistingAccountLink:
                true,
              message:
                "Is mobile number par HimRideG account pehle se hai. Security ke liye us existing account ko bina verification Google se auto-link nahi kiya gaya."
            });
        }
      } else {
        user =
          await createGoogleUser({
            googleProfile,
            role,
            phone
          });

        isNewUser =
          true;
      }
    }

    assertAccountCanLogin(
      user
    );

    saveGoogleProfile(
      user,
      googleProfile
    );

    const {
      accessToken,
      refreshToken,
      refreshTokenHash
    } = generateAuthTokens(
      user
    );

    user.refreshTokenHash =
      refreshTokenHash;

    await user.save();

    setRefreshTokenCookie(
      res,
      refreshToken
    );

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
            linkedExistingUser,
            provider:
              "google",
            accessToken,
            user:
              toSafeUserObject(
                user
              )
          },
          isNewUser
            ? `${role === "driver" ? "Driver" : "Customer"} Google account created successfully`
            : `${role === "driver" ? "Driver" : "Customer"} Google login successful`
        )
      );
  };

module.exports = {
  googleLogin
};
