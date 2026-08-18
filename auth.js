const User = require(
  "../models/User"
);

const Admin = require(
  "../models/Admin"
);

const ApiError = require(
  "../utils/ApiError"
);

const {
  verifyAccessToken
} = require(
  "../services/tokenService"
);

/*
|--------------------------------------------------------------------------
| Get Bearer Token
|--------------------------------------------------------------------------
*/

function getBearerToken(req) {
  const authorization =
    String(
      req.headers.authorization ||
        ""
    ).trim();

  if (
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    throw new ApiError(
      401,
      "Authentication token is required"
    );
  }

  const token =
    authorization
      .slice(7)
      .trim();

  if (!token) {
    throw new ApiError(
      401,
      "Authentication token is required"
    );
  }

  return token;
}

/*
|--------------------------------------------------------------------------
| Get Account ID From Token
|--------------------------------------------------------------------------
*/

function getAccountId(payload) {
  return (
    payload?.sub ||
    payload?.userId ||
    payload?.id ||
    payload?._id ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| Protect Route
|--------------------------------------------------------------------------
*/

const protect = async (
  req,
  res,
  next
) => {
  try {
    const token =
      getBearerToken(req);

    const payload =
      verifyAccessToken(token);

    if (!payload) {
      throw new ApiError(
        401,
        "Invalid authentication token"
      );
    }

    const accountId =
      getAccountId(payload);

    if (!accountId) {
      throw new ApiError(
        401,
        "Authentication token payload is invalid"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Authentication
    |--------------------------------------------------------------------------
    */

    if (
      payload.role === "admin"
    ) {
      const admin =
        await Admin.findById(
          accountId
        ).select("-password");

      if (!admin) {
        throw new ApiError(
          401,
          "Admin account no longer exists"
        );
      }

      req.user = admin;

      /*
      |--------------------------------------------------------------------------
      | Ensure Admin Role
      |--------------------------------------------------------------------------
      */

      req.user.role = "admin";

      req.auth = {
        token,
        payload,
        accountType: "admin"
      };

      return next();
    }

    /*
    |--------------------------------------------------------------------------
    | Customer / Driver Authentication
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findById(
        accountId
      );

    if (!user) {
      throw new ApiError(
        401,
        "User account no longer exists"
      );
    }

    if (
      user.isActive === false
    ) {
      throw new ApiError(
        403,
        "Your account is not active"
      );
    }

    if (
      user.accountStatus ===
        "blocked" ||
      user.accountStatus ===
        "deleted"
    ) {
      throw new ApiError(
        403,
        "Your account is not allowed to access this service"
      );
    }

    if (
      user.accountStatus ===
        "suspended"
    ) {
      throw new ApiError(
        403,
        "Your account is suspended"
      );
    }

    req.user = user;

    req.auth = {
      token,
      payload,
      accountType:
        user.role
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Allow Selected Roles
|--------------------------------------------------------------------------
*/

const allowRoles = (
  ...roles
) => {
  return (
    req,
    res,
    next
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(
          401,
          "Authentication required"
        );
      }

      if (
        !roles.includes(
          req.user.role
        )
      ) {
        throw new ApiError(
          403,
          "You are not allowed to access this route"
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  protect,
  allowRoles
};