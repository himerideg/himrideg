const User = require("../models/User");
const Booking = require("../models/Booking");
const WalletLedger = require("../models/WalletLedger");
const WalletTransaction = require("../models/WalletTransaction");
const Withdrawal = require("../models/Withdrawal");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const DirectDriverPayment = require("../models/DirectDriverPayment");
const RideAutoPayout = require("../models/RideAutoPayout");
const BookingReferenceArchive = require("../models/BookingReferenceArchive");
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
    .select("name phone wallet isOnline isAvailable currentRide driverProfile");
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

/*
|--------------------------------------------------------------------------
| Admin Test Driver — Full History Reset
|--------------------------------------------------------------------------
| Test account ko clean slate dene ke liye sirf terminal/past rides aur
| unse jude financial history records delete hote hain. Login/profile,
| approval, documents, saved UPI/bank/payout methods aur active ride safe
| rehte hain. Active ride ho to reset refuse hota hai taaki live customer
| journey kabhi silently delete na ho.
|--------------------------------------------------------------------------
*/
exports.resetDriverTestHistory = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Sirf admin test driver history reset kar sakta hai"
      });
    }

    if (String(req.body?.confirmation || "") !== "DELETE_TEST_HISTORY") {
      return res.status(400).json({
        success: false,
        code: "RESET_CONFIRMATION_REQUIRED",
        message: "History reset ke liye confirmation required hai"
      });
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
        message: "History reset se pehle is driver ka Test Mode ON karo"
      });
    }

    if (driver.currentRide) {
      return res.status(409).json({
        success: false,
        code: "ACTIVE_RIDE_PRESENT",
        message: "Driver ki active Ride chal rahi hai. Pehle Ride complete/cancel karo, phir Test History reset karo."
      });
    }

    const dueBefore = Number(feeDueOf(driver.wallet) || 0);
    const terminalStatuses = ["completed", "cancelled", "expired"];

    const pastRides = await Booking.find({
      driver: driver._id,
      status: { $in: terminalStatuses }
    })
      .select("_id")
      .lean();

    const bookingIds = pastRides.map((ride) => ride._id);

    const [
      walletLedgerResult,
      walletTransactionResult,
      withdrawalResult,
      withdrawalRequestResult,
      directPaymentResult,
      autoPayoutResult,
      archiveResult
    ] = await Promise.all([
      WalletLedger.deleteMany({ driver: driver._id }),
      WalletTransaction.deleteMany({ driver: driver._id }),
      Withdrawal.deleteMany({ driver: driver._id }),
      WithdrawalRequest.deleteMany({ driver: driver._id }),
      DirectDriverPayment.deleteMany({ driver: driver._id }),
      RideAutoPayout.deleteMany({ driver: driver._id }),
      BookingReferenceArchive.deleteMany({
        $or: [
          { originalDriver: driver._id },
          ...(bookingIds.length ? [{ booking: { $in: bookingIds } }] : [])
        ]
      })
    ]);

    const rideDeleteResult = bookingIds.length
      ? await Booking.deleteMany({ _id: { $in: bookingIds } })
      : { deletedCount: 0 };

    if (!driver.wallet) driver.wallet = {};
    driver.wallet.balance = 0;
    driver.wallet.totalEarned = 0;
    driver.wallet.totalWithdrawn = 0;
    driver.wallet.pendingAmount = 0;
    driver.wallet.cashCommissionDue = 0;
    driver.wallet.commissionDue = 0;
    driver.wallet.totalCommissionPaid = 0;
    driver.wallet.totalOnlineTransferred = 0;
    driver.wallet.lastSettledAt = null;

    if (!driver.driverProfile) driver.driverProfile = {};
    driver.driverProfile.rating = 0;
    driver.driverProfile.ratingCount = 0;
    driver.driverProfile.totalRides = 0;
    driver.driverProfile.completedRides = 0;
    driver.driverProfile.cancelledRides = 0;
    driver.driverProfile.acceptanceRate = 100;
    driver.driverProfile.cancellationRate = 0;

    if (driver.isOnline) {
      driver.isAvailable = true;
    }

    await driver.save();

    testMode.lastResetAt = new Date();
    testMode.lastResetAmount = dueBefore;
    testMode.updatedBy = adminId(req);
    await testMode.save();

    return res.status(200).json({
      success: true,
      message: `${driver.name || "Driver"} ki Test Ride/Earning/Payment history साफ हो गई और बकाया Platform Fee ₹0 हो गई।`,
      data: {
        driverId: String(driver._id),
        driverName: driver.name || "Driver",
        ridesDeleted: Number(rideDeleteResult.deletedCount || 0),
        walletLedgerDeleted: Number(walletLedgerResult.deletedCount || 0),
        walletTransactionsDeleted: Number(walletTransactionResult.deletedCount || 0),
        withdrawalsDeleted: Number(withdrawalResult.deletedCount || 0),
        withdrawalRequestsDeleted: Number(withdrawalRequestResult.deletedCount || 0),
        directPaymentsDeleted: Number(directPaymentResult.deletedCount || 0),
        autoPayoutsDeleted: Number(autoPayoutResult.deletedCount || 0),
        archivesDeleted: Number(archiveResult.deletedCount || 0),
        platformFeeDueBefore: dueBefore,
        platformFeeDueAfter: 0,
        totalEarnedAfter: 0,
        walletBalanceAfter: 0,
        activeRidePreserved: false,
        payoutMethodsPreserved: true,
        profilePreserved: true,
        resetAt: testMode.lastResetAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Test driver history reset nahi hui"
    });
  }
};
