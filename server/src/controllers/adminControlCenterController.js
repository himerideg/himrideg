const mongoose = require("mongoose");

const User = require("../models/User");
const Booking = require("../models/Booking");
const Complaint = require("../models/Complaint");
const AccountDeletionRequest = require("../models/AccountDeletionRequest");

let socketServer = null;
try {
  socketServer = require("../sockets/socketServer");
} catch (error) {
  socketServer = null;
}

let sendPushToUser = null;
try {
  ({ sendPushToUser } = require("../services/pushNotificationService"));
} catch (error) {
  sendPushToUser = null;
}

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Admin Control Center (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| Mounted under /api/v2/admin/control/*
|   GET    /summary                         — poore platform ke counts
|   GET    /users?role=&search=&status=     — poori customer / driver list
|   GET    /users/export?role=              — CSV download
|   GET    /users/:id/overview              — profile + complaints + warnings + rides
|   PATCH  /users/:id/block | /unblock      — customer + driver dono ke liye
|   POST   /users/:id/warn                  — driver ko warning
|   POST   /users/:id/delete                — admin khud account delete kare
|   GET    /complaints?status=&driverId=
|   PATCH  /complaints/:id                  — status / admin note
|   POST   /complaints/:id/warn             — complaint se seedha driver warning
|   GET    /deletion-requests?status=
|   PATCH  /deletion-requests/:id/approve | /reject
|--------------------------------------------------------------------------
*/

function isAdmin(req) {
  return req.user?.role === "admin";
}

function denied(res) {
  return res.status(403).json({ success: false, message: "Sirf admin ye dekh sakta hai." });
}

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

function validId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanText(value, max = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function startOfToday() {
  // IST day boundary
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - 5.5 * 60 * 60 * 1000);
}

function emitToUser(userId, eventName, payload) {
  try {
    if (!socketServer?.hasSocketServer?.()) return;
    const io = socketServer.getSocketServer();
    const id = String(userId);
    io.to(`user:${id}`).to(`driver:${id}`).emit(eventName, payload);
  } catch (error) {
    console.error("[AdminControl] realtime emit error:", error?.message || error);
  }
}

function pushToUser(userId, payload) {
  if (!sendPushToUser || !userId) return;
  sendPushToUser(userId, payload).catch(() => {});
}

const USER_LIST_FIELDS =
  "name phone email role profileImage isActive isBlocked blockedReason accountStatus isOnline isAvailable createdAt lastLoginAt lastSeenAt deletedAt " +
  "driverProfile.approvalStatus driverProfile.isApproved driverProfile.rating driverProfile.totalRides driverProfile.completedRides driverProfile.vehicle " +
  "wallet.balance wallet.commissionDue warnings._id warnings.level warnings.createdAt";

function userStatusOf(user) {
  if (!user) return "unknown";
  if (user.accountStatus === "deleted") return "deleted";
  if (user.accountStatus === "blocked" || user.isBlocked) return "blocked";
  if (user.accountStatus === "suspended") return "suspended";
  if (user.isActive === false) return "inactive";
  return "active";
}

function statusFilter(status) {
  switch (String(status || "").toLowerCase()) {
    case "active":
      return { accountStatus: { $nin: ["blocked", "deleted", "suspended"] }, isBlocked: { $ne: true }, isActive: { $ne: false } };
    case "blocked":
      return { $or: [{ accountStatus: "blocked" }, { isBlocked: true }] };
    case "deleted":
      return { accountStatus: "deleted" };
    case "online":
      return { isOnline: true, accountStatus: { $ne: "deleted" } };
    case "pending":
      return { "driverProfile.approvalStatus": { $in: ["not_submitted", "pending"] }, accountStatus: { $ne: "deleted" } };
    case "approved":
      return { "driverProfile.approvalStatus": "approved", accountStatus: { $ne: "deleted" } };
    default:
      return {};
  }
}

function buildUserQuery(req) {
  const role = String(req.query.role || "customer").toLowerCase() === "driver" ? "driver" : "customer";
  const query = { role, ...statusFilter(req.query.status) };
  const search = cleanText(req.query.search, 80);
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    const or = [{ name: rx }, { phone: rx }, { email: rx }];
    if (role === "driver") or.push({ "driverProfile.vehicle.registrationNumber": rx });
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: or }];
      delete query.$or;
    } else {
      query.$or = or;
    }
  }
  return { role, query };
}

/* ---------------------------------------------------------------- summary */
async function getSummary(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    const today = startOfToday();

    const [
      customersTotal,
      customersBlocked,
      customersDeleted,
      customersNewToday,
      driversTotal,
      driversApproved,
      driversPending,
      driversOnline,
      driversBlocked,
      driversDeleted,
      ridesToday,
      ridesCompletedToday,
      ridesCancelledToday,
      ridesActiveNow,
      complaintsOpen,
      complaintsHigh,
      deletionPending,
      commissionToday
    ] = await Promise.all([
      User.countDocuments({ role: "customer", accountStatus: { $ne: "deleted" } }),
      User.countDocuments({ role: "customer", $or: [{ accountStatus: "blocked" }, { isBlocked: true }] }),
      User.countDocuments({ role: "customer", accountStatus: "deleted" }),
      User.countDocuments({ role: "customer", createdAt: { $gte: today } }),
      User.countDocuments({ role: "driver", accountStatus: { $ne: "deleted" } }),
      User.countDocuments({ role: "driver", "driverProfile.approvalStatus": "approved", accountStatus: { $ne: "deleted" } }),
      User.countDocuments({ role: "driver", "driverProfile.approvalStatus": { $in: ["not_submitted", "pending"] }, accountStatus: { $ne: "deleted" } }),
      User.countDocuments({ role: "driver", isOnline: true, accountStatus: { $ne: "deleted" } }),
      User.countDocuments({ role: "driver", $or: [{ accountStatus: "blocked" }, { isBlocked: true }] }),
      User.countDocuments({ role: "driver", accountStatus: "deleted" }),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ status: "completed", completedAt: { $gte: today } }),
      Booking.countDocuments({ status: "cancelled", updatedAt: { $gte: today } }),
      Booking.countDocuments({ status: { $in: ["driver_assigned", "accepted", "fare_offered", "negotiating", "fare_accepted", "driver_arriving", "driver_arrived", "started"] } }),
      Complaint.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      Complaint.countDocuments({ status: { $in: ["open", "reviewing"] }, severity: "high" }),
      AccountDeletionRequest.countDocuments({ status: "pending" }),
      Booking.aggregate([
        { $match: { status: "completed", paymentStatus: "paid", completedAt: { $gte: today } } },
        { $group: { _id: null, commission: { $sum: { $ifNull: ["$platformCommissionAmount", 0] } }, fares: { $sum: { $ifNull: ["$finalFare", 0] } } } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customers: { total: customersTotal, blocked: customersBlocked, deleted: customersDeleted, newToday: customersNewToday },
        drivers: { total: driversTotal, approved: driversApproved, pending: driversPending, online: driversOnline, blocked: driversBlocked, deleted: driversDeleted },
        rides: { today: ridesToday, completedToday: ridesCompletedToday, cancelledToday: ridesCancelledToday, activeNow: ridesActiveNow },
        money: {
          paidFaresToday: Math.round(Number(commissionToday?.[0]?.fares || 0)),
          platformCommissionToday: Math.round(Number(commissionToday?.[0]?.commission || 0))
        },
        complaints: { open: complaintsOpen, highPriority: complaintsHigh },
        deletionRequests: { pending: deletionPending },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    return next(error);
  }
}

/* ------------------------------------------------------------------ users */
async function listUsers(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    const { role, query } = buildUserQuery(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));

    const [users, total] = await Promise.all([
      User.find(query).select(USER_LIST_FIELDS).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query)
    ]);

    const ids = users.map((user) => user._id);
    const [complaintCounts, rideCounts] = await Promise.all([
      role === "driver"
        ? Complaint.aggregate([{ $match: { driver: { $in: ids } } }, { $group: { _id: "$driver", total: { $sum: 1 }, open: { $sum: { $cond: [{ $in: ["$status", ["open", "reviewing"]] }, 1, 0] } } } }])
        : Complaint.aggregate([{ $match: { customer: { $in: ids } } }, { $group: { _id: "$customer", total: { $sum: 1 }, open: { $sum: 0 } } }]),
      Booking.aggregate([
        { $match: role === "driver" ? { driver: { $in: ids } } : { customer: { $in: ids } } },
        { $group: { _id: role === "driver" ? "$driver" : "$customer", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } } } }
      ])
    ]);

    const complaintMap = new Map(complaintCounts.map((row) => [String(row._id), row]));
    const rideMap = new Map(rideCounts.map((row) => [String(row._id), row]));

    const rows = users.map((user) => ({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      role: user.role,
      status: userStatusOf(user),
      isOnline: Boolean(user.isOnline),
      approvalStatus: user.driverProfile?.approvalStatus || "",
      rating: Number(user.driverProfile?.rating || 0) || null,
      vehicle: user.driverProfile?.vehicle
        ? [user.driverProfile.vehicle.brand, user.driverProfile.vehicle.model, user.driverProfile.vehicle.registrationNumber].filter(Boolean).join(" • ")
        : "",
      walletBalance: Number(user.wallet?.balance || 0),
      commissionDue: Number(user.wallet?.commissionDue || 0),
      warnings: Array.isArray(user.warnings) ? user.warnings.length : 0,
      complaints: complaintMap.get(String(user._id))?.total || 0,
      openComplaints: complaintMap.get(String(user._id))?.open || 0,
      rides: rideMap.get(String(user._id))?.total || 0,
      completedRides: rideMap.get(String(user._id))?.completed || 0,
      createdAt: user.createdAt,
      lastActiveAt: user.lastSeenAt || user.lastLoginAt || null
    }));

    return res.status(200).json({
      success: true,
      data: { role, users: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit }
    });
  } catch (error) {
    return next(error);
  }
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function exportUsers(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    const { role, query } = buildUserQuery(req);
    const users = await User.find(query).select(USER_LIST_FIELDS).sort({ createdAt: -1 }).limit(20000).lean();

    const header = role === "driver"
      ? ["Name", "Phone", "Email", "Status", "Approval", "Online", "Vehicle", "Rating", "Completed rides", "Wallet", "Commission due", "Warnings", "Joined"]
      : ["Name", "Phone", "Email", "Status", "Joined", "Last active"];

    const lines = [header.join(",")];
    users.forEach((user) => {
      const base = [user.name, user.phone, user.email || "", userStatusOf(user)];
      const row = role === "driver"
        ? [
            ...base,
            user.driverProfile?.approvalStatus || "",
            user.isOnline ? "yes" : "no",
            [user.driverProfile?.vehicle?.brand, user.driverProfile?.vehicle?.model, user.driverProfile?.vehicle?.registrationNumber].filter(Boolean).join(" "),
            user.driverProfile?.rating || "",
            user.driverProfile?.completedRides || 0,
            Number(user.wallet?.balance || 0),
            Number(user.wallet?.commissionDue || 0),
            Array.isArray(user.warnings) ? user.warnings.length : 0,
            user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : ""
          ]
        : [
            ...base,
            user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : "",
            user.lastSeenAt || user.lastLoginAt ? new Date(user.lastSeenAt || user.lastLoginAt).toISOString().slice(0, 10) : ""
          ];
      lines.push(row.map(csvCell).join(","));
    });

    const fileName = `himrideg-${role}s-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send("﻿" + lines.join("\n"));
  } catch (error) {
    return next(error);
  }
}

async function getUserOverview(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id" });

    const user = await User.findById(req.params.id)
      .select("-password -refreshTokenHash -refreshTokenHashes -fcmTokens")
      .lean();
    if (!user) return res.status(404).json({ success: false, message: "User nahi mila" });

    const isDriver = user.role === "driver";
    const rideMatch = isDriver ? { driver: user._id } : { customer: user._id };

    const [complaints, rideStats, recentRides, ratingStats, deletionRequests] = await Promise.all([
      Complaint.find(isDriver ? { driver: user._id } : { customer: user._id })
        .populate(isDriver ? "customer" : "driver", "name phone")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Booking.aggregate([{ $match: rideMatch }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.find(rideMatch)
        .select("bookingNumber status finalFare paymentStatus paymentMethod createdAt completedAt pickup.address dropoff.address drop.address rating")
        .populate(isDriver ? "customer" : "driver", "name phone")
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      isDriver
        ? Booking.aggregate([
            { $match: { driver: user._id, "rating.customerRating": { $ne: null } } },
            { $group: { _id: null, avg: { $avg: "$rating.customerRating" }, count: { $sum: 1 } } }
          ])
        : Promise.resolve([]),
      AccountDeletionRequest.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const statusCounts = Object.fromEntries(rideStats.map((row) => [row._id, row.count]));
    const totalRides = rideStats.reduce((sum, row) => sum + row.count, 0);

    return res.status(200).json({
      success: true,
      data: {
        user: { ...user, status: userStatusOf(user) },
        stats: {
          totalRides,
          completed: statusCounts.completed || 0,
          cancelled: statusCounts.cancelled || 0,
          statusCounts,
          rating: ratingStats?.[0] ? Math.round(ratingStats[0].avg * 10) / 10 : null,
          ratingCount: ratingStats?.[0]?.count || 0,
          complaints: complaints.length,
          openComplaints: complaints.filter((c) => ["open", "reviewing"].includes(c.status)).length,
          warnings: Array.isArray(user.warnings) ? user.warnings.length : 0
        },
        complaints,
        warnings: (Array.isArray(user.warnings) ? user.warnings : []).slice().reverse(),
        recentRides,
        deletionRequests
      }
    });
  } catch (error) {
    return next(error);
  }
}

/* ----------------------------------------------------------- block / warn */
async function setBlocked(req, res, next, blocked) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id" });
    const reason = cleanText(req.body?.reason, 1000);
    if (blocked && !reason) return res.status(400).json({ success: false, message: "Block karne ka reason zaroori hai." });

    const user = await User.findById(req.params.id);
    if (!user || !["customer", "driver"].includes(user.role)) return res.status(404).json({ success: false, message: "User nahi mila" });
    if (user.accountStatus === "deleted") return res.status(409).json({ success: false, message: "Deleted account ko block/unblock nahi kar sakte" });

    if (blocked) {
      user.isBlocked = true;
      user.blockedReason = reason;
      user.blockReason = reason;
      user.blockedAt = new Date();
      user.blockedBy = req.user._id;
      user.accountStatus = "blocked";
      if (user.role === "driver") {
        user.isOnline = false;
        user.isAvailable = false;
      }
    } else {
      user.isBlocked = false;
      user.blockedReason = "";
      user.blockReason = "";
      user.blockedAt = null;
      user.blockedBy = null;
      user.accountStatus = "active";
      user.isActive = true;
    }

    await user.save();

    emitToUser(user._id, blocked ? "account:blocked" : "account:unblocked", {
      userId: String(user._id),
      reason,
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      message: blocked ? "Account block ho gaya." : "Account unblock ho gaya.",
      data: { userId: String(user._id), status: userStatusOf(user) }
    });
  } catch (error) {
    return next(error);
  }
}

const blockUser = (req, res, next) => setBlocked(req, res, next, true);
const unblockUser = (req, res, next) => setBlocked(req, res, next, false);

async function addWarningToDriver({ driverId, message, reason, level, adminId }) {
  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "driver") {
    const error = new Error("Driver nahi mila");
    error.statusCode = 404;
    throw error;
  }

  const safeLevel = ["low", "medium", "high", "final"].includes(level) ? level : "medium";

  driver.warnings = Array.isArray(driver.warnings) ? driver.warnings : [];
  driver.warnings.push({
    message,
    reason: reason || "",
    level: safeLevel,
    acknowledged: false,
    acknowledgedAt: null,
    driverReply: "",
    repliedAt: null,
    issuedBy: adminId
  });
  await driver.save();

  const savedWarning = driver.warnings[driver.warnings.length - 1];

  emitToUser(driver._id, "driver:warning", {
    driverId: String(driver._id),
    warning: savedWarning,
    message,
    reason,
    level: safeLevel,
    timestamp: new Date()
  });

  pushToUser(driver._id, {
    title: safeLevel === "final" ? "⚠️ Final warning — HimRideG" : "⚠️ HimRideG warning",
    body: message.slice(0, 160),
    data: { type: "driver_warning", role: "driver", soundEvent: "warning" }
  });

  return { driver, warning: savedWarning };
}

async function warnUser(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id" });
    const message = cleanText(req.body?.message, 1000);
    if (message.length < 3) return res.status(400).json({ success: false, message: "Warning message likhein" });

    const { warning } = await addWarningToDriver({
      driverId: req.params.id,
      message,
      reason: cleanText(req.body?.reason, 1000),
      level: req.body?.level,
      adminId: req.user._id
    });

    return res.status(200).json({ success: true, message: "Warning driver ko bhej di gayi.", data: { warning } });
  } catch (error) {
    if (error?.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
}

/* -------------------------------------------------------------- complaints */
async function listComplaints(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    const query = {};
    const status = String(req.query.status || "").toLowerCase();
    if (status === "active") query.status = { $in: ["open", "reviewing"] };
    else if (Complaint.COMPLAINT_STATUSES.includes(status)) query.status = status;
    if (validId(req.query.driverId)) query.driver = req.query.driverId;
    if (req.query.severity && ["low", "medium", "high"].includes(req.query.severity)) query.severity = req.query.severity;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate("customer", "name phone")
        .populate("driver", "name phone profileImage driverProfile.vehicle driverProfile.rating warnings._id accountStatus isBlocked")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(query)
    ]);

    const driverIds = [...new Set(complaints.map((c) => idOf(c.driver)).filter(Boolean))].map((id) => new mongoose.Types.ObjectId(id));
    const perDriver = driverIds.length
      ? await Complaint.aggregate([{ $match: { driver: { $in: driverIds } } }, { $group: { _id: "$driver", total: { $sum: 1 } } }])
      : [];
    const perDriverMap = new Map(perDriver.map((row) => [String(row._id), row.total]));

    const rows = complaints.map((complaint) => ({
      ...complaint,
      driverComplaintCount: perDriverMap.get(idOf(complaint.driver)) || 1,
      driverWarningCount: Array.isArray(complaint.driver?.warnings) ? complaint.driver.warnings.length : 0
    }));

    return res.status(200).json({ success: true, data: { complaints: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) {
    return next(error);
  }
}

async function updateComplaint(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid complaint id" });

    const update = {};
    if (req.body?.status !== undefined) {
      if (!Complaint.COMPLAINT_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      update.status = req.body.status;
    }
    if (req.body?.adminNote !== undefined) update.adminNote = cleanText(req.body.adminNote, 2000);
    update.handledBy = req.user._id;
    update.handledAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint nahi mili" });

    if (["resolved", "dismissed"].includes(update.status)) {
      pushToUser(complaint.customer, {
        title: "Complaint update — HimRideG",
        body: update.status === "resolved"
          ? "Aapki complaint par action le liya gaya hai. Dhanyavaad."
          : "Aapki complaint review ho gayi hai.",
        data: { type: "complaint_update", role: "customer" }
      });
    }

    return res.status(200).json({ success: true, message: "Complaint update ho gayi.", data: { complaint } });
  } catch (error) {
    return next(error);
  }
}

async function warnFromComplaint(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid complaint id" });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint nahi mili" });

    const message = cleanText(req.body?.message, 1000);
    if (message.length < 3) return res.status(400).json({ success: false, message: "Warning message likhein" });

    const { warning } = await addWarningToDriver({
      driverId: complaint.driver,
      message,
      reason: `Customer complaint${complaint.bookingNumber ? ` (ride ${complaint.bookingNumber})` : ""}: ${complaint.category}`,
      level: req.body?.level,
      adminId: req.user._id
    });

    complaint.status = "warned";
    complaint.warningId = warning?._id || null;
    complaint.adminNote = cleanText(req.body?.adminNote || complaint.adminNote, 2000);
    complaint.handledBy = req.user._id;
    complaint.handledAt = new Date();
    await complaint.save();

    pushToUser(complaint.customer, {
      title: "Complaint update — HimRideG",
      body: "Aapki complaint par driver ko warning di gayi hai. Dhanyavaad.",
      data: { type: "complaint_update", role: "customer" }
    });

    return res.status(200).json({ success: true, message: "Driver ko warning bhej di gayi aur complaint update ho gayi.", data: { complaint, warning } });
  } catch (error) {
    if (error?.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
}

/* -------------------------------------------------------- account delete */
async function deletionBlockersFor(user) {
  const blockers = [];
  if (!user) return blockers;

  const activeRide = await Booking.findOne({
    $or: [{ customer: user._id }, { driver: user._id }],
    status: { $in: ["pending", "searching_driver", "driver_assigned", "accepted", "fare_offered", "negotiating", "fare_accepted", "driver_arriving", "driver_arrived", "started"] }
  }).select("_id bookingNumber");
  if (activeRide) blockers.push(`Active ride chal rahi hai (${activeRide.bookingNumber || activeRide._id})`);

  if (user.role === "driver") {
    const balance = Number(user.wallet?.balance || 0);
    const due = Math.max(Number(user.wallet?.commissionDue || 0), Number(user.wallet?.cashCommissionDue || 0));
    if (balance > 0) blockers.push(`Driver wallet me ₹${balance} baaki hai — pehle payout karein`);
    if (due > 0) blockers.push(`Driver par ₹${due} platform fee due hai`);
  }

  const unpaid = await Booking.countDocuments({
    customer: user._id,
    status: "completed",
    paymentStatus: { $ne: "paid" }
  });
  if (user.role === "customer" && unpaid > 0) blockers.push(`${unpaid} completed ride ka payment pending hai`);

  return blockers;
}

async function anonymizeUser(user, adminId) {
  const suffix = String(user._id).slice(-12);
  const tombstonePhone = `del${suffix}`.slice(0, 15);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        name: "Deleted user",
        phone: tombstonePhone,
        alternativePhone: "",
        profileImage: "",
        accountStatus: "deleted",
        isActive: false,
        isOnline: false,
        isAvailable: false,
        currentRide: null,
        fcmTokens: [],
        refreshTokenHash: null,
        refreshTokenHashes: [],
        deletedAt: new Date(),
        blockedBy: adminId || null
      },
      $unset: {
        email: "",
        googleId: ""
      }
    },
    { strict: false }
  );

  emitToUser(user._id, "account:deleted", { userId: String(user._id), timestamp: new Date() });
}

async function listDeletionRequests(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    const status = String(req.query.status || "pending").toLowerCase();
    const query = ["pending", "approved", "rejected", "cancelled"].includes(status) ? { status } : {};

    const requests = await AccountDeletionRequest.find(query)
      .populate("user", "name phone email role accountStatus wallet.balance wallet.commissionDue createdAt")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Live blockers dikhaao taaki admin pehle se jaan le
    const withBlockers = await Promise.all(
      requests.map(async (request) => {
        if (request.status !== "pending" || !request.user?._id) return { ...request, liveBlockers: [] };
        const user = await User.findById(request.user._id).select("role wallet");
        return { ...request, liveBlockers: await deletionBlockersFor(user) };
      })
    );

    return res.status(200).json({ success: true, data: { requests: withBlockers } });
  } catch (error) {
    return next(error);
  }
}

async function approveDeletion(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid request id" });

    const request = await AccountDeletionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request nahi mili" });
    if (request.status !== "pending") return res.status(409).json({ success: false, message: `Request pehle hi ${request.status} hai` });

    let user = request.user ? await User.findById(request.user) : null;
    if (!user && request.phone) user = await User.findOne({ phone: request.phone });

    if (!user) {
      request.status = "rejected";
      request.adminNote = cleanText(req.body?.adminNote || "Is number par koi account nahi mila", 1000);
      request.processedBy = req.user._id;
      request.processedAt = new Date();
      await request.save();
      return res.status(200).json({ success: true, message: "Is number par koi account nahi mila — request close kar di.", data: { request } });
    }

    const blockers = await deletionBlockersFor(user);
    if (blockers.length && req.body?.force !== true) {
      return res.status(409).json({
        success: false,
        code: "DELETION_BLOCKED",
        message: "Account abhi delete nahi ho sakta: " + blockers.join("; "),
        data: { blockers }
      });
    }

    await anonymizeUser(user, req.user._id);

    request.user = user._id;
    request.role = ["customer", "driver"].includes(user.role) ? user.role : request.role;
    request.status = "approved";
    request.blockers = blockers;
    request.adminNote = cleanText(req.body?.adminNote, 1000);
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Account delete ho gaya. Personal details hata di gayi; ride/payment records audit ke liye safe hain.",
      data: { request }
    });
  } catch (error) {
    return next(error);
  }
}

async function rejectDeletion(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid request id" });

    const request = await AccountDeletionRequest.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "rejected",
          adminNote: cleanText(req.body?.adminNote, 1000),
          processedBy: req.user._id,
          processedAt: new Date()
        }
      },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: "Pending request nahi mili" });

    if (request.user) {
      pushToUser(request.user, {
        title: "Account delete request",
        body: request.adminNote || "Aapki request abhi process nahi ho saki. Support se contact karein.",
        data: { type: "account_deletion", role: request.role }
      });
    }

    return res.status(200).json({ success: true, message: "Request reject ho gayi.", data: { request } });
  } catch (error) {
    return next(error);
  }
}

async function adminDeleteUser(req, res, next) {
  try {
    if (!isAdmin(req)) return denied(res);
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id" });

    const user = await User.findById(req.params.id);
    if (!user || !["customer", "driver"].includes(user.role)) return res.status(404).json({ success: false, message: "User nahi mila" });
    if (user.accountStatus === "deleted") return res.status(409).json({ success: false, message: "Account pehle hi delete hai" });

    const reason = cleanText(req.body?.reason, 1000);
    if (!reason) return res.status(400).json({ success: false, message: "Delete karne ka reason likhein" });

    const blockers = await deletionBlockersFor(user);
    if (blockers.length && req.body?.force !== true) {
      return res.status(409).json({ success: false, code: "DELETION_BLOCKED", message: "Account abhi delete nahi ho sakta: " + blockers.join("; "), data: { blockers } });
    }

    const request = await AccountDeletionRequest.create({
      user: user._id,
      role: user.role,
      source: "in_app",
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      reason: `Admin deleted: ${reason}`,
      accountFound: true,
      status: "approved",
      blockers,
      adminNote: reason,
      processedBy: req.user._id,
      processedAt: new Date()
    });

    await anonymizeUser(user, req.user._id);

    return res.status(200).json({ success: true, message: "Account delete ho gaya.", data: { request } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSummary,
  listUsers,
  exportUsers,
  getUserOverview,
  blockUser,
  unblockUser,
  warnUser,
  listComplaints,
  updateComplaint,
  warnFromComplaint,
  listDeletionRequests,
  approveDeletion,
  rejectDeletion,
  adminDeleteUser,
  // exported for tests
  _internal: { deletionBlockersFor, anonymizeUser, userStatusOf, buildUserQuery }
};
