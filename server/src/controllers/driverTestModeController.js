const DriverTestMode = require("../models/DriverTestMode");

exports.getDriverTestMode = async (req, res) => {
  try {
    if (String(req.user?.role || "").toLowerCase() !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Sirf driver test mode status dekh sakta hai"
      });
    }

    const driverId = req.user?._id || req.user?.id;
    const row = await DriverTestMode.findOne({ driver: driverId }).lean();

    return res.status(200).json({
      success: true,
      data: {
        enabled: Boolean(row?.enabled),
        note: row?.note || "",
        lastResetAt: row?.lastResetAt || null,
        lastResetAmount: Number(row?.lastResetAmount || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Test mode status load nahi hua"
    });
  }
};
