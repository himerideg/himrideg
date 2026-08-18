const validator = require("validator");
const ApiError = require("../utils/ApiError");

const normalizePhone = (phone) => {
  const value = String(phone || "").replace(/\D/g, "");

  if (value.length === 12 && value.startsWith("91")) {
    return value.slice(2);
  }

  return value;
};

const validatePhone = (phone) => {
  const normalizedPhone = normalizePhone(phone);

  if (!validator.isMobilePhone(normalizedPhone, "en-IN")) {
    throw new ApiError(
      400,
      "Please enter a valid Indian mobile number"
    );
  }

  return normalizedPhone;
};

const validateSendOtp = (body) => {
  const phone = validatePhone(body?.phone);

  return {
    phone
  };
};

const validateVerifyOtp = (body) => {
  const phone = validatePhone(body?.phone);
  const otp = String(body?.otp || "").trim();
  const name = String(body?.name || "").trim();

  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(
      400,
      "OTP must be a 6-digit number"
    );
  }

  if (name && name.length < 2) {
    throw new ApiError(
      400,
      "Name must contain at least 2 characters"
    );
  }

  if (name.length > 100) {
    throw new ApiError(
      400,
      "Name cannot exceed 100 characters"
    );
  }

  return {
    phone,
    otp,
    name
  };
};

module.exports = {
  normalizePhone,
  validatePhone,
  validateSendOtp,
  validateVerifyOtp
};