const ApiError = require("../utils/ApiError");

const {
  validatePhone
} = require("./authValidator");

/*
|--------------------------------------------------------------------------
| Driver Send OTP Validation
|--------------------------------------------------------------------------
*/

const validateDriverSendOtp = (body) => {
  const phone = validatePhone(body?.phone);

  return {
    phone
  };
};

/*
|--------------------------------------------------------------------------
| Driver Verify OTP Validation
|--------------------------------------------------------------------------
*/

const validateDriverVerifyOtp = (body) => {
  const phone = validatePhone(body?.phone);

  const otp = String(
    body?.otp || ""
  ).trim();

  const name = String(
    body?.name || ""
  ).trim();

  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(
      400,
      "OTP must be a 6-digit number"
    );
  }

  if (!name) {
    throw new ApiError(
      400,
      "Driver name is required"
    );
  }

  if (name.length < 2) {
    throw new ApiError(
      400,
      "Driver name must contain at least 2 characters"
    );
  }

  if (name.length > 100) {
    throw new ApiError(
      400,
      "Driver name cannot exceed 100 characters"
    );
  }

  return {
    phone,
    otp,
    name
  };
};

module.exports = {
  validateDriverSendOtp,
  validateDriverVerifyOtp
};