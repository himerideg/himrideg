const User = require("../models/User");
const DriverTestMode = require("../models/DriverTestMode");

const PLATFORM_FEE_BLOCK_THRESHOLD = 100;

function feeDueOf(wallet = {}) {
  return Math.max(
    0,
    Number(wallet?.commissionDue || 0),
    Number(wallet?.cashCommissionDue || 0)
  );
}

async function requirePlatformFeeBelowThreshold(req, res, next) {
  try {
    if (req.user?.role !== "driver") {
      return res.status(403).json({
        success: false,
        code: "DRIVER_REQUIRED",
        message: "Sirf driver ride accept kar sakta hai"
      });
    }

    const driverId = req.user?._id || req.user?.id;
    const [driver, testMode] = await Promise.all([
      User.findOne({
        _id: driverId,
        role: "driver"
      }).select("wallet"),
      DriverTestMode.findOne({
        driver: driverId,
        enabled: true
      }).select("enabled").lean()
    ]);

    if (!driver) {
      return res.status(404).json({
        success: false,
        code: "DRIVER_NOT_FOUND",
        message: "Driver account nahi mila"
      });
    }

    const platformFeeDue = feeDueOf(driver.wallet);
    const testModeEnabled = Boolean(testMode?.enabled);

    req.platformFeeStatus = {
      due: platformFeeDue,
      threshold: PLATFORM_FEE_BLOCK_THRESHOLD,
      blocked: !testModeEnabled && platformFeeDue >= PLATFORM_FEE_BLOCK_THRESHOLD,
      testMode: testModeEnabled
    };

    if (testModeEnabled) {
      return next();
    }

    if (platformFeeDue >= PLATFORM_FEE_BLOCK_THRESHOLD) {
      return res.status(402).json({
        success: false,
        code: "PLATFORM_FEE_REQUIRED",
        message: `नई Ride लेने के लिए पहले ₹${Math.ceil(platformFeeDue)} बकाया HimRideG प्लेटफॉर्म फीस जमा करें।`,
        data: req.platformFeeStatus
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  PLATFORM_FEE_BLOCK_THRESHOLD,
  feeDueOf,
  requirePlatformFeeBelowThreshold
};
