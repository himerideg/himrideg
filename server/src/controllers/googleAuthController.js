const crypto = require("crypto");

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
| Google Auth Constants
|--------------------------------------------------------------------------
|
| User.phone project me historically required + unique raha hai. Google
| Customer website login me mobile number pehle liya ja sakta hai aur Google
| account se identity verify ki jaati hai; SMS OTP nahi hota. Driver/legacy
| Google flow mobile na bheje to internal temporary unique phone identity
| fallback ke roop me use hoti hai, jise Basic Info me replace kiya ja sakta hai.
|
| Prefix intentionally normal Indian mobile number se match nahi karta.
|
*/

const GOOGLE_TEMP_PHONE_PREFIX =
  "GGL";

const GOOGLE_TEMP_PHONE_REGEX =
  /^GGL[0-9a-f]{12}$/i;

/*
|--------------------------------------------------------------------------
| Small Helpers
|--------------------------------------------------------------------------
*/

const text = (value) =>
  String(value || "").trim();

const normalizeEmail = (value) =>
  text(value)
    .toLowerCase()
    .slice(0, 180);

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalizeEmail(value)
  );

const normalizeExpectedEmail = (
  value
) => {
  const email =
    normalizeEmail(value);

  if (!email) {
    return "";
  }

  if (!isValidEmail(email)) {
    throw new ApiError(
      400,
      "Valid Google account email enter karo"
    );
  }

  return email;
};

const normalizeExpectedPhone = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    text(value) === ""
  ) {
    return "";
  }

  return normalizePhone(
    value,
    { required: true }
  );
};

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
        "Valid mobile number required hai"
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

const normalizeName = (
  name
) => {
  const cleanName =
    text(name)
      .replace(/\s+/g, " ");

  if (
    cleanName.length < 2
  ) {
    throw new ApiError(
      400,
      "Full name required hai"
    );
  }

  if (
    cleanName.length > 100
  ) {
    throw new ApiError(
      400,
      "Full name 100 characters se zyada nahi ho sakta"
    );
  }

  return cleanName;
};

const buildGoogleTemporaryPhone = (
  googleId
) => {
  const digest =
    crypto
      .createHash("sha256")
      .update(
        text(googleId)
      )
      .digest("hex")
      .slice(0, 12);

  return `${GOOGLE_TEMP_PHONE_PREFIX}${digest}`;
};

const isGoogleTemporaryPhone = (
  phone
) => {
  return GOOGLE_TEMP_PHONE_REGEX.test(
    text(phone)
  );
};

const hasRealIndianPhone = (
  phone
) => {
  return /^[6-9]\d{9}$/.test(
    text(phone)
  );
};

const needsGoogleBasicInfo = (
  user
) => {
  if (!user?.googleId) {
    return false;
  }

  if (
    user.googleBasicInfoCompleted ===
      true &&
    hasRealIndianPhone(
      user.phone
    ) &&
    text(user.name).length >= 2
  ) {
    return false;
  }

  return (
    isGoogleTemporaryPhone(
      user.phone
    ) ||
    !hasRealIndianPhone(
      user.phone
    ) ||
    text(user.name).length < 2 ||
    user.googleBasicInfoCompleted !==
      true
  );
};

/*
|--------------------------------------------------------------------------
| Refresh Cookie Helpers
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Safe User Object
|--------------------------------------------------------------------------
|
| Internal temporary Google phone frontend ko expose nahi hota. Frontend
| ko `needsBasicInfo` boolean milta hai jisse refresh ke baad bhi Basic Info
| page open rahega jab tak user real mobile + name save nahi karta.
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

  const pendingBasicInfo =
    needsGoogleBasicInfo(
      user
    );

  safeUser.needsBasicInfo =
    pendingBasicInfo;

  safeUser.authProvider =
    user.googleId
      ? "google"
      : "local";

  if (
    isGoogleTemporaryPhone(
      safeUser.phone
    )
  ) {
    safeUser.phone = "";
  }

  return safeUser;
};

/*
|--------------------------------------------------------------------------
| Account Access Guard
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Remember Google Refresh Session
|--------------------------------------------------------------------------
| Google se customer/driver login karne par previous valid device session ko
| overwrite nahi karte. Raw token nahi, sirf SHA-256 hash remember hota hai.
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

/*
|--------------------------------------------------------------------------
| Google Profile Synchronization
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Existing Account Lookup
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Create New Direct Google User
|--------------------------------------------------------------------------
|
| IMPORTANT:
| - Login page par mobile nahi maanga jaata.
| - Password create nahi hota aur password required nahi hai.
| - Google token verify hone ke turant baad HimRideG session create hota hai.
| - Real mobile Basic Info page par save hota hai.
|
*/

const createGoogleUser =
  async ({
    googleProfile,
    role,
    initialPhone = ""
  }) => {
    const temporaryPhone =
      buildGoogleTemporaryPhone(
        googleProfile.googleId
      );

    const firstPhone =
      hasRealIndianPhone(initialPhone)
        ? initialPhone
        : temporaryPhone;

    const baseUser = {
      role,
      name:
        googleProfile.name ||
        (
          role === "driver"
            ? "HimRideG Driver"
            : "HimRideG Customer"
        ),
      phone:
        firstPhone,
      email:
        googleProfile.email,
      googleEmail:
        googleProfile.email,
      googleId:
        googleProfile.googleId,
      googleLinkedAt:
        new Date(),
      googleBasicInfoCompleted:
        false,
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

    try {
      return await User.create(
        baseUser
      );
    } catch (error) {
      /*
      | Agar same Google request browser/network retry se parallel aa gayi,
      | unique temp phone / google index collision ke baad existing account
      | safely fetch karne ki koshish karenge.
      */
      if (
        error?.code === 11000
      ) {
        const existing =
          await User.findOne({
            googleId:
              googleProfile.googleId,
            role
          });

        if (existing) {
          return existing;
        }
      }

      throw error;
    }
  };

/*
|--------------------------------------------------------------------------
| POST /api/v2/auth/google
|--------------------------------------------------------------------------
*/

const googleLogin =
  async (
    req,
    res
  ) => {
    const role =
      normalizeRole(
        req.body?.role
      );

    const expectedEmail =
      normalizeExpectedEmail(
        req.body
          ?.expectedEmail
      );

    const expectedPhone =
      normalizeExpectedPhone(
        req.body
          ?.expectedPhone
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

    /*
    |-----------------------------------------------------------------------
    | Entered Email Must Match Verified Google Email
    |-----------------------------------------------------------------------
    |
    | Frontend email ko sirf login_hint ke roop me Google ko deta hai.
    | Security decision backend verified ID token email par hota hai.
    | Agar user doosra Google account select kare to login reject hota hai.
    |
    */

    if (
      expectedEmail &&
      googleProfile.email !==
        expectedEmail
    ) {
      throw new ApiError(
        409,
        `Google account email match nahi hui. ${expectedEmail} wale Google account se continue karo.`
      );
    }

    /*
    | Customer web login me mobile pehle enter hota hai, lekin SMS OTP
    | intentionally nahi bheja jaata. Google identity verify hone ke baad
    | wahi mobile account se bind hota hai. Mobile ko "Google verified"
    | claim nahi kiya jaata; Google account identity verify karta hai.
    */
    let phoneOwner = null;

    if (expectedPhone) {
      phoneOwner = await User.findOne({
        phone: expectedPhone
      });
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

    if (user && expectedPhone) {
      const currentRealPhone =
        hasRealIndianPhone(
          user.phone
        );

      if (
        currentRealPhone &&
        user.phone !== expectedPhone
      ) {
        throw new ApiError(
          409,
          "Entered mobile number is Google-linked HimRideG account se match nahi karta"
        );
      }

      if (
        phoneOwner &&
        String(phoneOwner._id) !==
          String(user._id)
      ) {
        throw new ApiError(
          409,
          "Ye mobile number pehle se doosre HimRideG account me registered hai"
        );
      }

      if (!currentRealPhone) {
        user.phone = expectedPhone;
        user.isPhoneVerified = false;
      }
    }

    if (!user) {
      if (phoneOwner) {
        throw new ApiError(
          409,
          "Ye mobile number pehle se HimRideG account me registered hai. Us account ke linked Google account se login karo."
        );
      }

      user =
        await createGoogleUser({
          googleProfile,
          role,
          initialPhone:
            expectedPhone
        });

      isNewUser =
        true;
    }

    assertAccountCanLogin(
      user
    );

    saveGoogleProfile(
      user,
      googleProfile
    );

    const requiresBasicInfo =
      needsGoogleBasicInfo(
        user
      );

    const {
      accessToken,
      refreshToken,
      refreshTokenHash
    } = generateAuthTokens(
      user
    );

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
            verifiedEmail:
              googleProfile.email,
            enteredPhone:
              expectedPhone ||
              (hasRealIndianPhone(user.phone) ? user.phone : ""),
            requiresBasicInfo,
            accessToken,
            ...(shouldReturnMobileRefreshToken(req)
              ? { refreshToken }
              : {}),
            user:
              toSafeUserObject(
                user
              )
          },
          requiresBasicInfo
            ? "Google login successful. Basic info complete karo."
            : `${role === "driver" ? "Driver" : "Customer"} Google login successful`
        )
      );
  };

/*
|--------------------------------------------------------------------------
| PATCH /api/v2/auth/google/basic-info
|--------------------------------------------------------------------------
|
| Access token already Google login ke baad mil chuka hota hai, isliye ye
| route protected hai. Yahan password kabhi required nahi hai.
|
*/

const completeGoogleBasicInfo =
  async (
    req,
    res
  ) => {
    const user =
      req.user;

    if (!user) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    if (!user.googleId) {
      throw new ApiError(
        403,
        "Basic Info route sirf Google login account ke liye hai"
      );
    }

    if (
      user.role !== "customer" &&
      user.role !== "driver"
    ) {
      throw new ApiError(
        403,
        "Google Basic Info sirf Customer ya Driver ke liye available hai"
      );
    }

    const name =
      normalizeName(
        req.body?.name
      );

    const phone =
      normalizePhone(
        req.body?.phone,
        {
          required: true
        }
      );

    const phoneOwner =
      await User.findOne({
        phone,
        _id: {
          $ne: user._id
        }
      });

    if (phoneOwner) {
      throw new ApiError(
        409,
        phoneOwner.role ===
          user.role
          ? "Ye mobile number pehle se doosre HimRideG account me registered hai"
          : `Ye mobile number pehle se ${phoneOwner.role} account me registered hai`
      );
    }

    user.name =
      name;

    user.phone =
      phone;

    /*
    | Google email verified hai, lekin mobile ko sirf user-entered contact
    | maana gaya hai. SMS OTP verification future me optional feature ke
    | roop me add ki ja sakti hai; Google login ko uspar depend nahi karna.
    */
    user.isPhoneVerified =
      false;

    user.googleBasicInfoCompleted =
      true;

    user.lastSeenAt =
      new Date();

    await user.save();

    const safeUser =
      toSafeUserObject(
        user
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            provider:
              "google",
            requiresBasicInfo:
              false,
            user:
              safeUser
          },
          user.role === "driver"
            ? "Basic info saved. Ab driver verification complete karo."
            : "Basic info saved successfully"
        )
      );
  };

module.exports = {
  googleLogin,
  completeGoogleBasicInfo
};
