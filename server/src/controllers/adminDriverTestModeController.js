const User = require("../models/User");
const DriverTestMode = require("../models/DriverTestMode");
const { feeDueOf } = require("../middlewares/platformFeeGate");

function isAdmin(req) {
  return String(req.user?.role || "").toLowerCase() === "admin";
}

function adminId(req) {
  return req.user?._id || req.user?.id || req.user?.userId || null;
}

async function getDriver(driverId) {
  return User.findOne({ _id: driverId, role: "driver" })
    .select("name phone wallet isOnline isAvailable currentRide");
}

exports.listDriverTestModes = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Sirf admin test mode manage kar sakta hai" });
    }

    const rows = await DriverTestMode.find({})
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        testModes: rows.map((row) => ({
          driverId: String(row.driver),
          enabled: Boolean(row.enabled),
          note: row.note || "",
          lastResetAt: row.lastResetAt || null,
          lastResetAmount: Number(row.lastResetAmount || 0),
          updatedAt: row.updatedAt || null
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Test mode list load nahi hui"
    });
  }
};

exports.updateDriverTestMode = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Sirf admin test mode manage kar sakta hai" });
    }

    const driver = await getDriver(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver account nahi mila" });
    }

    const enabled = Boolean(req.body?.enabled);
    const note = String(req.body?.note || "").trim().slice(0, 500);

    const row = await DriverTestMode.findOneAndUpdate(
      { driver: driver._id },
      {
        $set: {
          enabled,
          note,
          updatedBy: adminId(req)
        },
        $setOnInsert: {
          driver: driver._id
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: enabled
        ? `${driver.name || "Driver"} ka Test Mode ON ho gaya. Platform fee lock bypass rahega.`
        : `${driver.name || "Driver"} ka Test Mode OFF ho gaya. Normal platform fee rule apply hoga.`,
      data: {
        driverId: String(driver._id),
        enabled: Boolean(row.enabled),
        note: row.note || "",
        platformFeeDue: Number(feeDueOf(driver.wallet) || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Driver Test Mode update nahi hua"
    });
  }
};

exports.resetDriverTestPlatformFee = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Sirf admin test fee reset kar sakta hai" });
    }

    const driver = await getDriver(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver account nahi mila" });
    }

    const testMode = await DriverTestMode.findOne({ driver: driver._id });
    if (!testMode?.enabled) {
      return res.status(409).json({
        success: false,
        code: "TEST_MODE_REQUIRED",
        message: "Platform fee reset se pehle is driver ka Test Mode ON karo"
      });
    }

    const dueBefore = Number(feeDueOf(driver.wallet) || 0);

    if (!driver.wallet) driver.wallet = {};
    driver.wallet.commissionDue = 0;
    driver.wallet.cashCommissionDue = 0;

    if (driver.isOnline && !driver.currentRide) {
      driver.isAvailable = true;
    }

    await driver.save();

    testMode.lastResetAt = new Date();
    testMode.lastResetAmount = dueBefore;
    testMode.updatedBy = adminId(req);
    await testMode.save();

    return res.status(200).json({
      success: true,
      message: `Test platform fee ₹${Math.ceil(dueBefore)} reset ho gayi. Ride history aur earnings preserve hain.`,
      data: {
        driverId: String(driver._id),
        enabled: true,
        platformFeeDueBefore: dueBefore,
        platformFeeDueAfter: 0,
        totalEarned: Number(driver.wallet?.totalEarned || 0),
        lastResetAt: testMode.lastResetAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Test platform fee reset nahi hui"
    });
  }
};
