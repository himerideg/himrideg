const express = require("express");

const {
  sendCustomerOtp,
  verifyCustomerOtp,
  refreshAccessToken,
  updateCustomerProfile
} = require("../controllers/authController");

const {
  sendDriverOtp,
  verifyDriverOtp
} = require("../controllers/driverAuthController");

const {
  protect,
  allowRoles
} = require("../middlewares/auth");

const User = require("../models/User");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Stats — Home page ke liye (no auth required)
|--------------------------------------------------------------------------
| GET /api/v2/auth/stats
*/

router.get("/stats", async (req, res) => {
  try {
    const [customerCount, driverCount] = await Promise.all([
      User.countDocuments({ role: "customer", accountStatus: { $ne: "deleted" } }),
      User.countDocuments({ role: "driver", "driverProfile.isApproved": true, accountStatus: { $ne: "blocked" } })
    ]);

    // Format: exact number tak floor to nearest 10, then show "X+"
    const fmt = (n) => {
      if (n < 10) return String(n);
      const floored = Math.floor(n / 10) * 10;
      return `${floored}+`;
    };

    return res.status(200).json({
      success: true,
      data: {
        customers: fmt(customerCount),
        drivers: fmt(driverCount),
        rawCustomers: customerCount,
        rawDrivers: driverCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Stats fetch failed" });
  }
});

/*
|--------------------------------------------------------------------------
| Customer Authentication
|--------------------------------------------------------------------------
|
| Frontend:
|
| POST /api/v2/auth/customer/send-otp
| POST /api/v2/auth/customer/verify-otp
|
*/

router.post(
  "/customer/send-otp",
  sendCustomerOtp
);

router.post(
  "/customer/verify-otp",
  verifyCustomerOtp
);

/*
|--------------------------------------------------------------------------
| Customer Profile
|--------------------------------------------------------------------------
|
| Frontend:
|
| PATCH /api/v2/auth/customer/profile
|
*/

router.patch(
  "/customer/profile",
  protect,
  allowRoles("customer"),
  updateCustomerProfile
);

/*
|--------------------------------------------------------------------------
| Driver Authentication Compatibility Routes
|--------------------------------------------------------------------------
|
| Current frontend:
|
| POST /api/v2/auth/driver/send-otp
| POST /api/v2/auth/driver/verify-otp
|
| Existing app.js ka:
|
| /api/v2/driver/auth
|
| bhi waise hi kaam karta rahega.
|
*/

router.post(
  "/driver/send-otp",
  sendDriverOtp
);

router.post(
  "/driver/verify-otp",
  verifyDriverOtp
);

/*
|--------------------------------------------------------------------------
| Refresh Session
|--------------------------------------------------------------------------
|
| Customer aur Driver dono ke liye.
|
*/

router.post(
  "/refresh",
  refreshAccessToken
);

/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| app.use("/api/v2/auth", authRoutes)
|
| ko Express Router chahiye.
|
| Yahan object export nahi karna.
|
*/

module.exports = router;