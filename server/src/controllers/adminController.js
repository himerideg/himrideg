const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Admin = require("../models/Admin");
const User = require("../models/User");

const {
  driverDocumentsDirectory
} = require("../config/uploads");
const Booking = require("../models/Booking");

const {
  getSocketServer,
  hasSocketServer
} = require("../sockets/socketServer");

/*
|--------------------------------------------------------------------------
| Generate Admin Access Token
|--------------------------------------------------------------------------
*/

function generateAdminToken(
  admin
) {
  const jwtSecret =
    process.env
      .JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    process.env
      .ACCESS_TOKEN_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT access secret server .env file me missing hai."
    );
  }

  const tokenExpiry =
    process.env
      .JWT_ACCESS_EXPIRES_IN ||
    process.env
      .JWT_EXPIRES_IN ||
    "7d";

  return jwt.sign(
    {
      userId:
        admin._id,

      id:
        admin._id,

      role:
        "admin",

      email:
        admin.email
    },

    jwtSecret,

    {
      expiresIn:
        tokenExpiry
    }
  );
}

/*
|--------------------------------------------------------------------------
| Admin Request Check
|--------------------------------------------------------------------------
*/

function isAdminRequest(req) {
  return (
    req.user?.role ===
    "admin"
  );
}

/*
|--------------------------------------------------------------------------
| Realtime Driver Event
|--------------------------------------------------------------------------
*/

function emitDriverRealtime(
  driverId,
  eventName,
  payload
) {
  if (
    !driverId ||
    !eventName ||
    !hasSocketServer()
  ) {
    return;
  }

  try {
    const io =
      getSocketServer();

    const id =
      String(driverId);

    io.to(
      `user:${id}`
    )
      .to(
        `driver:${id}`
      )
      .emit(
        eventName,
        payload
      );
  } catch (error) {
    console.error(
      "Driver realtime emit error:",
      error.message
    );
  }
}

/*
|--------------------------------------------------------------------------
| Disconnect Blocked Driver
|--------------------------------------------------------------------------
*/

function disconnectBlockedDriver(
  driverId
) {
  if (
    !driverId ||
    !hasSocketServer()
  ) {
    return;
  }

  const id =
    String(driverId);

  setTimeout(
    async () => {
      try {
        const io =
          getSocketServer();

        const sockets =
          await io
            .in(
              `driver:${id}`
            )
            .fetchSockets();

        for (
          const socket of
            sockets
        ) {
          socket.disconnect(
            true
          );
        }
      } catch (error) {
        console.error(
          "Driver socket disconnect error:",
          error.message
        );
      }
    },
    250
  );
}

/*
|--------------------------------------------------------------------------
| Safe Driver Object
|--------------------------------------------------------------------------
*/

function getSafeDriver(
  driver
) {
  if (!driver) {
    return null;
  }

  if (
    typeof driver
      .toSafeObject ===
    "function"
  ) {
    return driver
      .toSafeObject();
  }

  const driverObject =
    typeof driver
      .toObject ===
    "function"
      ? driver.toObject()
      : {
          ...driver
        };

  delete driverObject
    .password;

  delete driverObject.__v;

  delete driverObject
    .socketId;

  delete driverObject
    .fcmTokens;

  delete driverObject
    .loginAttempts;

  delete driverObject
    .accountLockedUntil;

  delete driverObject
    .deletedAt;

  return driverObject;
}

/*
|--------------------------------------------------------------------------
| Admin Login
|--------------------------------------------------------------------------
*/

async function loginAdmin(
  req,
  res
) {
  try {
    const email =
      String(
        req.body?.email ||
          ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        req.body
          ?.password ||
          ""
      );

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Admin email aur password required hain."
        });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Valid admin email enter karo."
        });
    }

    const admin =
      await Admin.findOne({
        email
      });

    if (!admin) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Admin email ya password galat hai."
        });
    }

    const passwordMatched =
      await admin
        .comparePassword(
          password
        );

    if (
      !passwordMatched
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Admin email ya password galat hai."
        });
    }

    const accessToken =
      generateAdminToken(
        admin
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Admin login successful",

        data: {
          accessToken,

          user: {
            id:
              admin._id,

            _id:
              admin._id,

            name:
              admin.name,

            email:
              admin.email,

            role:
              "admin"
          }
        }
      });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Admin login failed"
      });
  }
}

/*
|--------------------------------------------------------------------------
| Admin Profile
|--------------------------------------------------------------------------
*/

async function getAdminProfile(
  req,
  res
) {
  try {
    if (
      !isAdminRequest(
        req
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Sirf admin is route ko access kar sakta hai."
        });
    }

    const adminId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!adminId) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Admin authentication required."
        });
    }

    const admin =
      await Admin
        .findById(
          adminId
        )
        .select(
          "-password"
        );

    if (!admin) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Admin account nahi mila."
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Admin profile fetched successfully",

        data: {
          user: {
            id:
              admin._id,

            _id:
              admin._id,

            name:
              admin.name,

            email:
              admin.email,

            role:
              "admin",

            createdAt:
              admin.createdAt
          }
        }
      });
  } catch (error) {
    console.error(
      "Get admin profile error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Admin profile fetch nahi ho payi."
      });
  }
}

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

async function getAdminDashboard(
  req,
  res
) {
  try {
    if (
      !isAdminRequest(
        req
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Sirf admin dashboard access kar sakta hai."
        });
    }

    const [
      totalCustomers,
      totalDrivers,
      approvedDrivers,
      waitingDrivers,
      blockedDrivers,
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      cancelledBookings
    ] =
      await Promise.all([
        User.countDocuments({
          role: "customer"
        }),

        User.countDocuments({
          role: "driver"
        }),

        User.countDocuments({
          role: "driver",
          "driverProfile.isApproved":
            true,
          "driverProfile.approvalStatus":
            "approved",
          accountStatus: {
            $ne: "blocked"
          }
        }),

        User.countDocuments({
          role: "driver",
          "driverProfile.approvalStatus":
            {
              $in: [
                "not_submitted",
                "pending"
              ]
            }
        }),

        User.countDocuments({
          role: "driver",
          accountStatus:
            "blocked"
        }),

        Booking.countDocuments(
          {}
        ),

        Booking.countDocuments({
          status: {
            $in: [
              "pending",
              "searching_driver"
            ]
          }
        }),

        Booking.countDocuments({
          status: {
            $in: [
              "driver_assigned",
              "accepted",
              "fare_offered",
              "negotiating",
              "fare_accepted",
              "driver_arriving",
              "driver_arrived",
              "started"
            ]
          }
        }),

        Booking.countDocuments({
          status:
            "completed"
        }),

        Booking.countDocuments({
          status:
            "cancelled"
        })
      ]);

    const dashboardData = {
      customers:
        totalCustomers,

      totalCustomers,

      drivers:
        totalDrivers,

      totalDrivers,

      approvedDrivers,

      waitingDrivers,

      pendingDrivers:
        waitingDrivers,

      blockedDrivers,

      bookings:
        totalBookings,

      totalBookings,

      pendingBookings,

      activeBookings,

      completedBookings,

      cancelledBookings
    };

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Admin dashboard data fetched successfully",

        data:
          dashboardData,

        stats:
          dashboardData
      });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Admin dashboard data load nahi hua."
      });
  }
}

/*
|--------------------------------------------------------------------------
| Get Drivers
|--------------------------------------------------------------------------
*/

async function getDrivers(
  req,
  res
) {
  try {
    if (
      !isAdminRequest(
        req
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Sirf admin drivers dekh sakta hai."
        });
    }

    const status =
      String(
        req.query
          ?.status ||
          ""
      )
        .trim()
        .toLowerCase();

    const search =
      String(
        req.query
          ?.search ||
          ""
      ).trim();

    const filter = {
      role: "driver"
    };

    if (
      status ===
        "waiting" ||
      status ===
        "pending"
    ) {
      filter[
        "driverProfile.approvalStatus"
      ] = {
        $in: [
          "not_submitted",
          "pending"
        ]
      };
    }

    if (
      status ===
      "approved"
    ) {
      filter[
        "driverProfile.approvalStatus"
      ] = "approved";

      filter[
        "driverProfile.isApproved"
      ] = true;
    }

    if (
      status ===
      "rejected"
    ) {
      filter[
        "driverProfile.approvalStatus"
      ] = "rejected";
    }

    if (
      status ===
      "suspended"
    ) {
      filter[
        "driverProfile.approvalStatus"
      ] = "suspended";
    }

    if (
      status ===
      "blocked"
    ) {
      filter.accountStatus =
        "blocked";
    }

    if (search) {
      const safeSearch =
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const searchRegex =
        new RegExp(
          safeSearch,
          "i"
        );

      filter.$or = [
        {
          name:
            searchRegex
        },

        {
          phone:
            searchRegex
        },

        {
          email:
            searchRegex
        },

        {
          "driverProfile.licenseNumber":
            searchRegex
        },

        {
          "driverProfile.vehicle.brand":
            searchRegex
        },

        {
          "driverProfile.vehicle.model":
            searchRegex
        },

        {
          "driverProfile.vehicle.registrationNumber":
            searchRegex
        }
      ];
    }

    const drivers =
      await User
        .find(filter)
        .sort({
          createdAt: -1
        })
        .select(
          "-password -socketId -fcmTokens -loginAttempts -accountLockedUntil -deletedAt"
        );

    const safeDrivers =
      drivers.map(
        getSafeDriver
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Drivers fetched successfully",

        count:
          safeDrivers.length,

        drivers:
          safeDrivers,

        data: {
          drivers:
            safeDrivers,

          count:
            safeDrivers.length
        }
      });
  } catch (error) {
    console.error(
      "Get drivers error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Drivers load nahi hue."
      });
  }
}

/*
|--------------------------------------------------------------------------
| Update Driver
|--------------------------------------------------------------------------
*/

async function updateDriver(
  req,
  res
) {
  try {
    if (
      !isAdminRequest(
        req
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Sirf admin driver update kar sakta hai."
        });
    }

    const driverId =
      String(
        req.params?.id ||
          ""
      ).trim();

    const action =
      String(
        req.params
          ?.action ||
          ""
      )
        .trim()
        .toLowerCase();

    if (
      !mongoose.Types
        .ObjectId
        .isValid(
          driverId
        )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Valid driver ID required hai."
        });
    }

    const allowedActions =
      [
        "approve",
        "reject",
        "warn",
        "block",
        "unblock",
        "suspend",
        "reject-unblock-request"
      ];

    if (
      !allowedActions
        .includes(
          action
        )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            `Unsupported driver action: ${action}`
        });
    }

    const driver =
      await User.findOne(
        {
          _id:
            driverId,

          role:
            "driver"
        }
      );

    if (!driver) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Driver account nahi mila."
        });
    }

    const adminId =
      req.user?._id ||
      req.user?.id ||
      req.user
        ?.userId ||
      null;

    const message =
      String(
        req.body
          ?.message ||
          ""
      ).trim();

    const reason =
      String(
        req.body
          ?.reason ||
          ""
      ).trim();

    const adminNote =
      String(
        req.body
          ?.adminNote ||
          ""
      ).trim();

    const requestedLevel =
      String(
        req.body
          ?.level ||
          "medium"
      )
        .trim()
        .toLowerCase();

    const warningLevel =
      [
        "low",
        "medium",
        "high",
        "final"
      ].includes(
        requestedLevel
      )
        ? requestedLevel
        : "medium";

    let responseMessage =
      "Driver update ho gaya.";

    let realtimeEvent =
      "";

    let realtimePayload =
      null;

    /*
    |--------------------------------------------------------------------------
    | Approve
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "approve"
    ) {
      // Launch rule: saare required documents upload + ADMIN VERIFIED hone chahiye.
      // Pending document ke saath driver approve nahi hoga.
      const requiredDocTypes = ["aadhaar", "driving_license", "vehicle_rc", "vehicle_photo", "permit"];
      const docs = driver.driverProfile?.documents || [];

      const missingOrRejected = requiredDocTypes.filter(docType => {
        const doc = docs.find(d => d.documentType === docType && d.documentUrl);
        if (!doc) return true;
        if (doc.verificationStatus !== "verified") return true;
        return false;
      });

      if (missingOrRejected.length > 0) {
        const labelMap = {
          aadhaar: "Aadhaar Card",
          driving_license: "Driving Licence",
          vehicle_rc: "Vehicle RC",
          vehicle_photo: "Vehicle Photo",
          permit: "Commercial Permit"
        };
        const missingNames = missingOrRejected.map(t => labelMap[t] || t).join(", ");
        return res.status(400).json({
          success: false,
          message: `Driver approve nahi ho sakta. In documents ko pehle admin verify kare: ${missingNames}`
        });
      }
      driver
        .driverProfile
        .approvalStatus =
        "approved";

      driver
        .driverProfile
        .isApproved =
        true;

      driver
        .driverProfile
        .rejectionReason =
        "";

      driver
        .driverProfile
        .approvedAt =
        new Date();

      driver
        .driverProfile
        .approvedBy =
        adminId;

      driver
        .accountStatus =
        "active";

      driver.isActive =
        true;

      driver.blockReason =
        "";

      driver.blockedAt =
        null;

      driver.blockedBy =
        null;

      responseMessage =
        "Driver successfully approve ho gaya.";

      realtimeEvent =
        "driver:approved";

      realtimePayload = {
        driverId,

        message:
          responseMessage,

        timestamp:
          new Date()
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Reject
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "reject"
    ) {
      driver
        .driverProfile
        .approvalStatus =
        "rejected";

      driver
        .driverProfile
        .isApproved =
        false;

      driver
        .driverProfile
        .rejectionReason =
        reason ||
        message ||
        "Admin ne driver application reject ki.";

      driver
        .driverProfile
        .approvedAt =
        null;

      driver
        .driverProfile
        .approvedBy =
        null;

      driver.isOnline =
        false;

      driver.isAvailable =
        false;

      responseMessage =
        "Driver application reject ho gayi.";

      realtimeEvent =
        "driver:rejected";

      realtimePayload = {
        driverId,

        reason:
          driver
            .driverProfile
            .rejectionReason,

        message:
          responseMessage,

        timestamp:
          new Date()
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Warning
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "warn"
    ) {
      const warningMessage =
        message ||
        reason;

      if (
        !warningMessage
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Warning message required hai."
          });
      }

      driver.warnings =
        Array.isArray(
          driver.warnings
        )
          ? driver.warnings
          : [];

      driver.warnings.push(
        {
          message:
            warningMessage,

          reason,

          level:
            warningLevel,

          acknowledged:
            false,

          acknowledgedAt:
            null,

          driverReply:
            "",

          repliedAt:
            null,

          issuedBy:
            adminId
        }
      );

      driver.lastSeenAt =
        new Date();

      const savedWarning =
        driver.warnings[
          driver.warnings
            .length - 1
        ];

      responseMessage =
        "Warning driver ko bhej di gayi.";

      realtimeEvent =
        "driver:warning";

      realtimePayload = {
        driverId,

        warning:
          savedWarning,

        message:
          warningMessage,

        reason,

        level:
          warningLevel,

        timestamp:
          new Date()
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Block
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "block"
    ) {
      const blockReason =
        reason ||
        message;

      if (!blockReason) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Driver block karne ka reason required hai."
          });
      }

      driver.accountStatus =
        "blocked";

      driver.isActive =
        false;

      driver.isOnline =
        false;

      driver.isAvailable =
        false;

      driver.blockReason =
        blockReason;

      driver.blockedAt =
        new Date();

      driver.blockedBy =
        adminId;

      driver.unblockRequest =
        {
          status:
            "none",

          message:
            "",

          requestedAt:
            null,

          adminNote:
            "",

          reviewedAt:
            null,

          reviewedBy:
            null
        };

      responseMessage =
        "Driver successfully block ho gaya.";

      realtimeEvent =
        "driver:blocked";

      realtimePayload = {
        driverId,

        reason:
          blockReason,

        message:
          responseMessage,

        timestamp:
          new Date()
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Unblock
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "unblock"
    ) {
      driver.accountStatus =
        "active";

      driver.isActive =
        true;

      driver.isOnline =
        false;

      driver.isAvailable =
        false;

      driver.blockReason =
        "";

      driver.blockedAt =
        null;

      driver.blockedBy =
        null;

      driver.unblockRequest =
        {
          status:
            "approved",

          message:
            driver
              .unblockRequest
              ?.message ||
            "",

          requestedAt:
            driver
              .unblockRequest
              ?.requestedAt ||
            null,

          adminNote,

          reviewedAt:
            new Date(),

          reviewedBy:
            adminId
        };

      responseMessage =
        "Driver successfully unblock ho gaya.";

      realtimeEvent =
        "driver:unblocked";

      realtimePayload = {
        driverId,

        adminNote,

        message:
          responseMessage,

        timestamp:
          new Date()
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Reject Unblock Request
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "reject-unblock-request"
    ) {
      if (
        driver
          .accountStatus !==
        "blocked"
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "Driver blocked nahi hai."
          });
      }

      driver.unblockRequest =
        {
          status:
            "rejected",

          message:
            driver
              .unblockRequest
              ?.message ||
            "",

          requestedAt:
            driver
              .unblockRequest
              ?.requestedAt ||
            null,

          adminNote:
            adminNote ||
            reason ||
            "Admin ne unblock request reject ki.",

          reviewedAt:
            new Date(),

          reviewedBy:
            adminId
        };

      responseMessage =
        "Driver unblock request reject ho gayi.";

      realtimeEvent =
        "driver:unblock-request-rejected";

      realtimePayload = {
        driverId,

        adminNote:
          driver
            .unblockRequest
            .adminNote,

        message:
          responseMessage,

        timestamp:
          new Date()
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Suspend
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "suspend"
    ) {
      driver
        .driverProfile
        .approvalStatus =
        "suspended";

      driver
        .driverProfile
        .isApproved =
        false;

      driver.accountStatus =
        "suspended";

      driver.isOnline =
        false;

      driver.isAvailable =
        false;

      responseMessage =
        "Driver suspend ho gaya.";

      realtimeEvent =
        "driver:suspended";

      realtimePayload = {
        driverId,

        reason:
          reason ||
          message ||
          "Admin ne account suspend kiya.",

        message:
          responseMessage,

        timestamp:
          new Date()
      };
    }

    await driver.save();

    if (
      realtimeEvent &&
      realtimePayload
    ) {
      emitDriverRealtime(
        driver._id,
        realtimeEvent,
        realtimePayload
      );
    }

    if (
      action ===
        "block" ||
      action ===
        "suspend"
    ) {
      disconnectBlockedDriver(
        driver._id
      );
    }

    const safeDriver =
      getSafeDriver(
        driver
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          responseMessage,

        driver:
          safeDriver,

        data: {
          driver:
            safeDriver
        }
      });
  } catch (error) {
    console.error(
      "Update driver error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Driver update nahi hua."
      });
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Get Customers
|--------------------------------------------------------------------------
| GET /api/v2/admin/customers
| Query params: search, filter (all/active/blocked), page, limit
*/

async function getCustomers(req, res) {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({
        success: false,
        message: "Sirf admin customers dekh sakta hai."
      });
    }

    const search = String(req.query.search || "").trim();
    const filter = String(req.query.filter || "all");
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = { role: "customer" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (filter === "blocked") {
      query.isBlocked = true;
    } else if (filter === "active") {
      query.isBlocked = { $ne: true };
      query.isActive = { $ne: false };
    }

    const [customers, total] = await Promise.all([
      User.find(query)
        .select(
          "name phone email profileImage isBlocked isActive blockedReason blockedAt createdAt lastLoginAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customers,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[Admin] getCustomers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Customers load nahi ho sake."
    });
  }
}

/*
|--------------------------------------------------------------------------
| Update Customer — Block / Unblock
|--------------------------------------------------------------------------
| PATCH /api/v2/admin/customers/:id/:action
| action: block | unblock
*/

async function updateCustomer(req, res) {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({
        success: false,
        message: "Sirf admin yeh action kar sakta hai."
      });
    }

    const { id, action } = req.params;

    const customer = await User.findOne({
      _id: id,
      role: "customer"
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer nahi mila."
      });
    }

    if (action === "block") {
      const reason = String(req.body.reason || "").trim();

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Block karne ka reason zaroori hai."
        });
      }

      customer.isBlocked = true;
      customer.blockedReason = reason;
      customer.blockedAt = new Date();
      customer.blockedBy = req.user._id;

      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Customer block ho gaya.",
        data: { customer }
      });
    }

    if (action === "unblock") {
      customer.isBlocked = false;
      customer.blockedReason = "";
      customer.blockedAt = null;
      customer.blockedBy = null;

      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Customer unblock ho gaya.",
        data: { customer }
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid action. Sirf block ya unblock allowed hai."
    });
  } catch (error) {
    console.error("[Admin] updateCustomer error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Customer update nahi ho saka."
    });
  }
}

/*
|--------------------------------------------------------------------------
| Admin: Serve Driver Document File
|--------------------------------------------------------------------------
| GET /api/v2/admin/drivers/:driverId/documents/:documentId/file
| Admin auth required — returns the raw document file (image/pdf)
*/

const fs = require("fs");
const path = require("path");

async function getDriverDocument(req, res) {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({
        success: false,
        message: "Sirf admin documents dekh sakta hai."
      });
    }

    const { driverId, documentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: "Invalid driver ID." });
    }

    const driver = await User.findOne({ _id: driverId, role: "driver" });

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver nahi mila." });
    }

    const document = driver.driverProfile?.documents?.id(documentId);

    if (!document || !document.documentUrl) {
      return res.status(404).json({ success: false, message: "Document nahi mila." });
    }

    const fileName = path.basename(String(document.documentUrl));
    const filePath = path.join(driverDocumentsDirectory, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Document file disk par nahi mili." });
    }

    // Determine content type by extension
    const ext = path.extname(fileName).toLowerCase();
    const contentTypeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".pdf": "application/pdf"
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.sendFile(filePath);
  } catch (error) {
    console.error("[Admin] getDriverDocument error:", error.message);
    return res.status(500).json({ success: false, message: "Document serve nahi ho saka." });
  }
}

/*
|--------------------------------------------------------------------------
| Admin: Verify or Reject a Driver Document
|--------------------------------------------------------------------------
| PATCH /api/v2/admin/drivers/:driverId/documents/:documentId/:action
| action: verify | reject
| body (reject only): { reason: "..." }
*/

async function verifyDriverDocument(req, res) {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ success: false, message: "Sirf admin document verify kar sakta hai." });
    }

    const { driverId, documentId, action } = req.params;

    if (!["verify", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action 'verify' ya 'reject' hona chahiye." });
    }

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: "Invalid driver ID." });
    }

    const driver = await User.findOne({ _id: driverId, role: "driver" });
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver nahi mila." });
    }

    const document = driver.driverProfile?.documents?.id(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document nahi mila." });
    }

    const adminId = req.user?._id || req.user?.id || req.user?.userId || null;

    if (action === "verify") {
      document.verificationStatus = "verified";
      document.rejectionReason = "";
      document.verifiedBy = adminId;
      document.verifiedAt = new Date();
    }

    if (action === "reject") {
      const reason = String(req.body?.reason || "").trim() || "Document clear nahi hai. Dobara upload karo.";
      document.verificationStatus = "rejected";
      document.rejectionReason = reason;
      document.verifiedBy = null;
      document.verifiedAt = null;
    }

    await driver.save();

    // Realtime update driver ke paas bhejna
    if (hasSocketServer()) {
      try {
        const io = getSocketServer();
        const id = String(driver._id);
        io.to(`user:${id}`).to(`driver:${id}`).emit("document:status:updated", {
          documentId,
          documentType: document.documentType,
          verificationStatus: document.verificationStatus,
          rejectionReason: document.rejectionReason || "",
          message: action === "verify"
            ? `${document.documentType} document verify ho gaya!`
            : `${document.documentType} document reject hua: ${document.rejectionReason}`
        });
      } catch (e) {
        console.error("[Admin] document socket emit error:", e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: action === "verify" ? "Document verified ho gaya." : "Document reject ho gaya.",
      data: {
        documentId,
        documentType: document.documentType,
        verificationStatus: document.verificationStatus,
        rejectionReason: document.rejectionReason || ""
      }
    });
  } catch (error) {
    console.error("[Admin] verifyDriverDocument error:", error.message);
    return res.status(500).json({ success: false, message: "Document update nahi ho saka." });
  }
}

// NEW: Admin update & lock driver legal name
async function updateDriverLegalName(req, res) {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ success: false, message: "Sirf admin naam update kar sakta hai." });
    }
    const { driverId } = req.params;
    const { legalName, lock } = req.body;
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: "Invalid driver ID." });
    }
    if (!String(legalName || "").trim()) {
      return res.status(400).json({ success: false, message: "Naam khali nahi ho sakta." });
    }
    const driver = await User.findOne({ _id: driverId, role: "driver" });
    if (!driver) return res.status(404).json({ success: false, message: "Driver nahi mila." });
    if (driver.driverProfile?.legalNameVerified) {
      return res.status(400).json({ success: false, message: "Naam already verified & locked hai." });
    }
    const adminId = req.user?._id || req.user?.id || null;
    driver.driverProfile.legalName = String(legalName).trim();
    if (lock) {
      driver.driverProfile.legalNameVerified = true;
      driver.driverProfile.legalNameVerifiedBy = adminId;
      driver.driverProfile.legalNameVerifiedAt = new Date();
    }
    await driver.save();
    if (hasSocketServer()) {
      try {
        const io = getSocketServer();
        const id = String(driver._id);
        io.to(`user:${id}`).to(`driver:${id}`).emit("driver:name:updated", {
          legalName: driver.driverProfile.legalName,
          legalNameVerified: driver.driverProfile.legalNameVerified,
          message: lock
            ? `Aapka naam verify ho gaya: ${driver.driverProfile.legalName}`
            : `Admin ne naam update kiya: ${driver.driverProfile.legalName}`
        });
      } catch (e) {
        console.error("[Admin] name socket error:", e.message);
      }
    }
    return res.status(200).json({
      success: true,
      message: lock ? "Naam verify karke lock kar diya gaya." : "Naam update ho gaya.",
      data: { legalName: driver.driverProfile.legalName, legalNameVerified: driver.driverProfile.legalNameVerified }
    });
  } catch (error) {
    console.error("[Admin] updateDriverLegalName error:", error.message);
    return res.status(500).json({ success: false, message: "Naam update nahi ho saka." });
  }
}


/*
|--------------------------------------------------------------------------
| Configure Razorpay Route Linked Account
|--------------------------------------------------------------------------
|
| Linked Account Razorpay Dashboard/API KYC complete hone ke baad uska
| acc_... ID driver profile se map kiya ja sakta hai. Online ride payment
| settlement service isi ID par driver share automatically transfer karta hai.
|
*/
async function setDriverRouteAccount(req, res) {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({
        success: false,
        message: "Sirf admin Route account configure kar sakta hai."
      });
    }

    const driverId = String(req.params?.driverId || "").trim();
    const linkedAccountId = String(
      req.body?.razorpayLinkedAccountId ||
      req.body?.linkedAccountId ||
      ""
    ).trim();
    const routeStatus = String(
      req.body?.routeStatus ||
      (linkedAccountId ? "active" : "not_created")
    ).trim();

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({
        success: false,
        message: "Valid driver ID required hai."
      });
    }

    if (linkedAccountId && !/^acc_[A-Za-z0-9]+$/.test(linkedAccountId)) {
      return res.status(400).json({
        success: false,
        message: "Razorpay Linked Account ID acc_ se start honi chahiye."
      });
    }

    const driver = await User.findOne({
      _id: driverId,
      role: "driver"
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver nahi mila."
      });
    }

    driver.driverProfile.razorpayLinkedAccountId = linkedAccountId;
    driver.driverProfile.razorpayRouteStatus = routeStatus;

    await driver.save();

    return res.status(200).json({
      success: true,
      message: linkedAccountId
        ? "Driver Razorpay Route account map ho gaya."
        : "Driver Razorpay Route account mapping clear ho gayi.",
      data: {
        driverId: driver._id,
        razorpayLinkedAccountId: driver.driverProfile.razorpayLinkedAccountId,
        razorpayRouteStatus: driver.driverProfile.razorpayRouteStatus
      }
    });
  } catch (error) {
    console.error("[Admin] setDriverRouteAccount error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Razorpay Route account save nahi hua."
    });
  }
}

module.exports = {
  loginAdmin,
  getAdminProfile,
  getAdminDashboard,
  getDrivers,
  updateDriver,
  getCustomers,
  updateCustomer,
  getDriverDocument,
  verifyDriverDocument,
  updateDriverLegalName,  // NEW
  setDriverRouteAccount
};