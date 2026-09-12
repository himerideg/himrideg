const User = require("../models/User");

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
    const driver = await User.findOne({
      _id: driverId,
      role: "driver"
    }).select("wallet");

    if (!driver) {
      return res.status(404).json({
        success: false,
        code: "DRIVER_NOT_FOUND",
        message: "Driver account nahi mila"
      });
    }

    const platformFeeDue = feeDueOf(driver.wallet);

    req.platformFeeStatus = {
      due: platformFeeDue,
      threshold: PLATFORM_FEE_BLOCK_THRESHOLD,
      blocked: platformFeeDue >= PLATFORM_FEE_BLOCK_THRESHOLD
    };

    if (platformFeeDue >= PLATFORM_FEE_BLOCK_THRESHOLD) {
      return res.status(402).json({
        success: false,
        code: "PLATFORM_FEE_REQUIRED",
        message: `नई राइड स्वीकार करने के लिए पहले ₹${Math.ceil(platformFeeDue)} बकाया HimRideG प्लेटफॉर्म फीस जमा करें।`,
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
