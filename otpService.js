const crypto = require("crypto");
const OTP = require("../constants/otp");

const generateRandomOtp = () => {
  const min = Math.pow(10, OTP.LENGTH - 1);
  const max = Math.pow(10, OTP.LENGTH) - 1;

  return String(
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

const generateOtp = () => {
  if (OTP.DEVELOPMENT.ENABLE_TEST_OTP) {
    return OTP.DEVELOPMENT.TEST_OTP;
  }

  return generateRandomOtp();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};

const verifyOtp = (plainOtp, hashedOtp) => {
  return hashOtp(plainOtp) === hashedOtp;
};

const getExpiryTime = () => {
  return new Date(
    Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000
  );
};

const isExpired = (expiresAt) => {
  return new Date() > expiresAt;
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp,
  getExpiryTime,
  isExpired
};