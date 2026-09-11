const User = require("../models/User");
const Booking = require("../models/Booking");
const WalletLedger = require("../models/WalletLedger");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const DriverPayoutMethod = require("../models/DriverPayoutMethod");

const ACTIVE_RIDE_STATUSES = [
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived",
  "arrived",
  "started",
  "payment_pending"
];

async function duplicateStringCount(Model, field, extraMatch = {}, options = {}) {
  const lower = options.lower !== false;
  const valueExpression = {
    $trim: {
      input: {
        $toString: {
          $ifNull: [`$${field}`, ""]
        }
      }
    }
  };

  const normalizedExpression = lower
    ? { $toLower: valueExpression }
    : valueExpression;

  const rows = await Model.aggregate([
    { $match: extraMatch },
    { $project: { normalizedKey: normalizedExpression } },
    { $match: { normalizedKey: { $ne: "" } } },
    { $group: { _id: "$normalizedKey", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "groups" }
  ]);

  return Number(rows?.[0]?.groups || 0);
}

async function orphanReferenceCount({ Model, localField, targetModel, requirePresent = false }) {
  const match = requirePresent
    ? { [localField]: { $ne: null } }
    : {};

  const rows = await Model.aggregate([
    { $match: match },
    {
      $lookup: {
        from: targetModel.collection.name,
        localField,
        foreignField: "_id",
        as: "__auditTarget"
      }
    },
    {
      $match: {
        $expr: {
          $eq: [{ $size: "$__auditTarget" }, 0]
        }
      }
    },
    { $count: "count" }
  ]);

  return Number(rows?.[0]?.count || 0);
}

async function multipleActiveRideOwnerCount(field) {
  const rows = await Booking.aggregate([
    {
      $match: {
        [field]: { $ne: null },
        status: { $in: ACTIVE_RIDE_STATUSES }
      }
    },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "owners" }
  ]);

  return Number(rows?.[0]?.owners || 0);
}

async function multiplePrimaryPayoutCount() {
  const rows = await DriverPayoutMethod.aggregate([
    { $match: { isPrimary: true } },
    { $group: { _id: "$driver", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "drivers" }
  ]);

  return Number(rows?.[0]?.drivers || 0);
}

async function duplicateLedgerIdempotencyCount() {
  const rows = await WalletLedger.aggregate([
    {
      $project: {
        key: {
          $trim: {
            input: {
              $toString: {
                $ifNull: ["$idempotencyKey", ""]
              }
            }
          }
        }
      }
    },
    { $match: { key: { $ne: "" } } },
    { $group: { _id: "$key", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "groups" }
  ]);

  return Number(rows?.[0]?.groups || 0);
}

async function payoutMethodDuplicateCount() {
  const rows = await DriverPayoutMethod.aggregate([
    {
      $project: {
        driver: 1,
        type: 1,
        key: {
          $cond: [
            { $eq: ["$type", "upi"] },
            {
              $toLower: {
                $trim: {
                  input: {
                    $toString: {
                      $ifNull: ["$upiId", ""]
                    }
                  }
                }
              }
            },
            {
              $concat: [
                {
                  $trim: {
                    input: {
                      $toString: {
                        $ifNull: ["$accountNumber", ""]
                      }
                    }
                  }
                },
                "|",
                {
                  $toUpper: {
                    $trim: {
                      input: {
                        $toString: {
                          $ifNull: ["$ifsc", ""]
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    },
    { $match: { key: { $ne: "" } } },
    {
      $group: {
        _id: {
          driver: "$driver",
          type: "$type",
          key: "$key"
        },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } },
    { $count: "groups" }
  ]);

  return Number(rows?.[0]?.groups || 0);
}

async function runDatabaseIntegrityAudit() {
  const startedAt = Date.now();

  const [
    totalUsers,
    customers,
    drivers,
    totalBookings,
    totalLedgers,
    totalWithdrawals,
    totalPayoutMethods,
    duplicateEmails,
    duplicatePhones,
    duplicateVehicleRegistrations,
    orphanBookingCustomers,
    orphanBookingDrivers,
    orphanLedgerDrivers,
    orphanLedgerBookings,
    orphanWithdrawalDrivers,
    orphanPayoutDrivers,
    multipleActiveRidesByDriver,
    multipleActiveRidesByCustomer,
    multiplePrimaryPayoutDrivers,
    duplicateLedgerIdempotencyKeys,
    duplicatePayoutMethods,
    negativeDriverWallets,
    approvalFlagMismatches
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "driver" }),
    Booking.countDocuments({}),
    WalletLedger.countDocuments({}),
    WithdrawalRequest.countDocuments({}),
    DriverPayoutMethod.countDocuments({}),
    duplicateStringCount(User, "email"),
    duplicateStringCount(User, "phone", {}, { lower: false }),
    duplicateStringCount(
      User,
      "driverProfile.vehicle.registrationNumber",
      { role: "driver" }
    ),
    orphanReferenceCount({
      Model: Booking,
      localField: "customer",
      targetModel: User,
      requirePresent: true
    }),
    orphanReferenceCount({
      Model: Booking,
      localField: "driver",
      targetModel: User,
      requirePresent: true
    }),
    orphanReferenceCount({
      Model: WalletLedger,
      localField: "driver",
      targetModel: User,
      requirePresent: true
    }),
    orphanReferenceCount({
      Model: WalletLedger,
      localField: "booking",
      targetModel: Booking,
      requirePresent: true
    }),
    orphanReferenceCount({
      Model: WithdrawalRequest,
      localField: "driver",
      targetModel: User,
      requirePresent: true
    }),
    orphanReferenceCount({
      Model: DriverPayoutMethod,
      localField: "driver",
      targetModel: User,
      requirePresent: true
    }),
    multipleActiveRideOwnerCount("driver"),
    multipleActiveRideOwnerCount("customer"),
    multiplePrimaryPayoutCount(),
    duplicateLedgerIdempotencyCount(),
    payoutMethodDuplicateCount(),
    User.countDocuments({
      role: "driver",
      $or: [
        { "wallet.balance": { $lt: 0 } },
        { "wallet.totalEarned": { $lt: 0 } },
        { "wallet.totalWithdrawn": { $lt: 0 } },
        { "wallet.pendingAmount": { $lt: 0 } },
        { "wallet.commissionDue": { $lt: 0 } },
        { "wallet.cashCommissionDue": { $lt: 0 } }
      ]
    }),
    User.countDocuments({
      role: "driver",
      $or: [
        {
          "driverProfile.approvalStatus": "approved",
          "driverProfile.isApproved": { $ne: true }
        },
        {
          "driverProfile.isApproved": true,
          "driverProfile.approvalStatus": { $ne: "approved" }
        }
      ]
    })
  ]);

  const issues = {
    duplicateEmails,
    duplicatePhones,
    duplicateVehicleRegistrations,
    orphanBookingCustomers,
    orphanBookingDrivers,
    orphanLedgerDrivers,
    orphanLedgerBookings,
    orphanWithdrawalDrivers,
    orphanPayoutDrivers,
    multipleActiveRidesByDriver,
    multipleActiveRidesByCustomer,
    multiplePrimaryPayoutDrivers,
    duplicateLedgerIdempotencyKeys,
    duplicatePayoutMethods,
    negativeDriverWallets,
    approvalFlagMismatches
  };

  const issueTotal = Object.values(issues).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const summary = {
    mode: "read-only",
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    healthy: issueTotal === 0,
    totals: {
      users: totalUsers,
      customers,
      drivers,
      bookings: totalBookings,
      walletLedgers: totalLedgers,
      withdrawals: totalWithdrawals,
      payoutMethods: totalPayoutMethods
    },
    issueTotal,
    issues
  };

  console.log(`🔎 DB_INTEGRITY_AUDIT ${JSON.stringify(summary)}`);
  return summary;
}

module.exports = {
  runDatabaseIntegrityAudit
};
