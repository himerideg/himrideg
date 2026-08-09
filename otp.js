const OTP = {
  LENGTH: 6,

  EXPIRY_MINUTES: 5,

  MAX_ATTEMPTS: 5,

  MAX_RESENDS: 3,

  RESEND_COOLDOWN_SECONDS: 30,

  PURPOSES: {
    CUSTOMER_LOGIN: "customer_login",

    DRIVER_LOGIN: "driver_login",

    PHONE_VERIFICATION: "phone_verification",

    PASSWORD_RESET: "password_reset",

    RIDE_START: "ride_start",

    ADMIN_VERIFICATION: "admin_verification"
  },

  DEVELOPMENT: {
    ENABLE_TEST_OTP:
      process.env.NODE_ENV === "development",

    TEST_OTP: "123456"
  }
};

module.exports = OTP;