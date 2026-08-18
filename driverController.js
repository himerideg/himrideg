const fs = require("node:fs");
const path = require("node:path");

const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const {
  driverProfileDirectory,
  driverDocumentsDirectory
} = require("../config/uploads");

const driverService = require(
  "../services/driverService"
);

const {
  validateDriverLocation
} = require(
  "../validators/driverValidator"
);

const ALLOWED_DOCUMENT_TYPES =
  new Set([
    "aadhaar",
    "driving_license",
    "vehicle_rc",
    "insurance",
    "pollution_certificate",
    "permit",
    "fitness_certificate",
    "vehicle_photo"
  ]);

/*
|--------------------------------------------------------------------------
| Ensure Driver
|--------------------------------------------------------------------------
*/

function ensureDriver(req) {
  if (!req.user?._id) {
    throw new ApiError(
      401,
      "Authentication required"
    );
  }

  if (
    req.user.role !== "driver"
  ) {
    throw new ApiError(
      403,
      "Only drivers can access this route"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Text Cleaners
|--------------------------------------------------------------------------
*/

function cleanText(
  value,
  maximumLength = 150
) {
  return String(value || "")
    .trim()
    .slice(0, maximumLength);
}

function cleanPhone(value) {
  const phone = String(value || "")
    .replace(/[^0-9+]/g, "")
    .slice(0, 15);

  if (
    phone &&
    !/^\+?[0-9]{10,15}$/.test(
      phone
    )
  ) {
    throw new ApiError(
      400,
      "Valid alternative mobile number enter karo"
    );
  }

  return phone;
}

function cleanEmail(value) {
  const email = String(value || "")
    .trim()
    .toLowerCase()
    .slice(0, 150);

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new ApiError(
      400,
      "Valid email address enter karo"
    );
  }

  return email || undefined;
}

/*
|--------------------------------------------------------------------------
| File Helpers
|--------------------------------------------------------------------------
*/

function fileUrl(req, file) {
  const fileName = encodeURIComponent(
    String(file?.filename || "")
  );

  return `${req.protocol}://${req.get(
    "host"
  )}/uploads/drivers/profile/${fileName}`;
}

function removeFile(filePath) {
  if (!filePath) {
    return;
  }

  fs.unlink(filePath, () => {});
}

function localPathFromUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const pathname = new URL(url).pathname;
    const fileName = path.basename(pathname);

    if (!fileName) {
      return "";
    }

    return path.join(
      driverProfileDirectory,
      fileName
    );
  } catch (error) {
    return "";
  }
}

function privateDocumentPath(
  fileName
) {
  const safeFileName =
    path.basename(
      String(fileName || "")
    );

  if (!safeFileName) {
    return "";
  }

  return path.join(
    driverDocumentsDirectory,
    safeFileName
  );
}

/*
|--------------------------------------------------------------------------
| Get Driver
|--------------------------------------------------------------------------
*/

async function getDriver(req) {
  const driver =
    await User.findOne({
      _id: req.user._id,
      role: "driver"
    });

  if (!driver) {
    throw new ApiError(
      404,
      "Driver account not found"
    );
  }

  return driver;
}

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

async function getProfile(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await getDriver(req);

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver profile loaded successfully",

        data: {
          driver:
            driver.toSafeObject()
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

async function updateProfile(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await getDriver(req);

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "alternativePhone"
      )
    ) {
      driver.alternativePhone =
        cleanPhone(
          req.body.alternativePhone
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "email"
      )
    ) {
      driver.email =
        cleanEmail(
          req.body.email
        );
    }

    driver.driverProfile.address =
      cleanText(
        req.body.address,
        500
      );

    const vehicle =
      req.body.vehicle || {};

    const allowedVehicleTypes = [
      "hatchback",
      "sedan",
      "suv",
      "traveller",
      "other"
    ];

    const allowedFuelTypes = [
      "petrol",
      "diesel",
      "cng",
      "electric",
      "hybrid",
      "other"
    ];

    if (
      allowedVehicleTypes.includes(
        vehicle.vehicleType
      )
    ) {
      driver
        .driverProfile
        .vehicle
        .vehicleType =
        vehicle.vehicleType;
    }

    if (
      allowedFuelTypes.includes(
        vehicle.fuelType
      )
    ) {
      driver
        .driverProfile
        .vehicle
        .fuelType =
        vehicle.fuelType;
    }

    driver
      .driverProfile
      .vehicle
      .brand =
      cleanText(
        vehicle.brand,
        100
      );

    driver
      .driverProfile
      .vehicle
      .model =
      cleanText(
        vehicle.model,
        100
      );

    driver
      .driverProfile
      .vehicle
      .color =
      cleanText(
        vehicle.color,
        50
      );

    driver
      .driverProfile
      .vehicle
      .registrationNumber =
      cleanText(
        vehicle.registrationNumber,
        30
      ).toUpperCase();

    const seatingCapacity =
      Number(
        vehicle.seatingCapacity
      );

    if (
      Number.isInteger(
        seatingCapacity
      ) &&
      seatingCapacity >= 1 &&
      seatingCapacity <= 30
    ) {
      driver
        .driverProfile
        .vehicle
        .seatingCapacity =
        seatingCapacity;
    }

    await driver.save();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver profile updated successfully",

        data: {
          driver:
            driver.toSafeObject()
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Profile Photo
|--------------------------------------------------------------------------
*/

async function uploadProfilePhoto(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    if (!req.file) {
      throw new ApiError(
        400,
        "Profile photo required"
      );
    }

    const driver =
      await getDriver(req);

    const oldPhotoPath =
      localPathFromUrl(
        driver.profileImage
      );

    driver.profileImage =
      fileUrl(
        req,
        req.file
      );

    await driver.save();

    if (oldPhotoPath) {
      removeFile(
        oldPhotoPath
      );
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Profile photo updated successfully",

        data: {
          profileImage:
            driver.profileImage,

          driver:
            driver.toSafeObject()
        }
      });
  } catch (error) {
    if (req.file?.path) {
      removeFile(
        req.file.path
      );
    }

    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Upload Document
|--------------------------------------------------------------------------
*/

async function uploadDocument(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const documentType =
      String(
        req.params?.documentType ||
          ""
      )
        .trim()
        .toLowerCase();

    if (
      !ALLOWED_DOCUMENT_TYPES.has(
        documentType
      )
    ) {
      throw new ApiError(
        400,
        "Invalid document type"
      );
    }

    if (!req.file) {
      throw new ApiError(
        400,
        "Document file required"
      );
    }

    const driver =
      await getDriver(req);

    const existing =
      driver
        .driverProfile
        .documents
        .find(
          (document) =>
            document.documentType ===
            documentType
        );

    const documentUrl =
      req.file.filename;

    if (existing) {
      const oldPath =
        privateDocumentPath(
          existing.documentUrl
        );

      existing.documentUrl =
        documentUrl;

      existing.verificationStatus =
        "pending";

      existing.rejectionReason =
        "";

      existing.verifiedBy =
        null;

      existing.verifiedAt =
        null;

      if (
        req.body?.documentNumber
      ) {
        existing.documentNumber =
          cleanText(
            req.body
              .documentNumber,
            50
          ).toUpperCase();
      }

      if (
        req.body?.nameOnDocument
      ) {
        existing.nameOnDocument =
          cleanText(
            req.body
              .nameOnDocument,
            100
          );
      }

      await driver.save();

      if (
        oldPath &&
        oldPath !==
          req.file.path
      ) {
        removeFile(
          oldPath
        );
      }
    } else {
      driver
        .driverProfile
        .documents
        .push({
          documentType,

          documentNumber:
            cleanText(
              req.body
                ?.documentNumber,
              50
            ).toUpperCase(),

          nameOnDocument:
            cleanText(
              req.body
                ?.nameOnDocument,
              100
            ),

          documentUrl,

          verificationStatus:
            "pending"
        });

      await driver.save();
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver document uploaded successfully",

        data: {
          documents:
            driver
              .driverProfile
              .documents
        }
      });
  } catch (error) {
    if (req.file?.path) {
      removeFile(
        req.file.path
      );
    }

    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Download Driver Document
|--------------------------------------------------------------------------
*/

async function downloadDocument(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await getDriver(req);

    const document =
      driver
        .driverProfile
        .documents
        .id(
          req.params.documentId
        );

    if (!document) {
      throw new ApiError(
        404,
        "Document not found"
      );
    }

    const filePath =
      privateDocumentPath(
        document.documentUrl
      );

    if (
      !filePath ||
      !fs.existsSync(
        filePath
      )
    ) {
      throw new ApiError(
        404,
        "Document file not found"
      );
    }

    return res.sendFile(
      filePath
    );
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Driver Dashboard
|--------------------------------------------------------------------------
*/

async function getDashboard(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const result =
      await driverService
        .getDriverDashboard(
          req.user._id
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver dashboard loaded successfully",

        data: result
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Go Online
|--------------------------------------------------------------------------
*/

async function goOnline(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await driverService
        .setDriverOnline(
          req.user._id
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver is online",

        data: {
          driver
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Go Offline
|--------------------------------------------------------------------------
*/

async function goOffline(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await driverService
        .setDriverOffline(
          req.user._id
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver is offline",

        data: {
          driver
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Available
|--------------------------------------------------------------------------
*/

async function becomeAvailable(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await driverService
        .setDriverAvailable(
          req.user._id
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver available hai",

        data: {
          driver
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Busy
|--------------------------------------------------------------------------
*/

async function becomeBusy(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await driverService
        .setDriverBusy(
          req.user._id
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver busy hai",

        data: {
          driver
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Location
|--------------------------------------------------------------------------
*/

async function updateLocation(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const location =
      validateDriverLocation(
        req.body
      );

    const result =
      await driverService
        .updateDriverLocation(
          req.user._id,
          location
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver location updated successfully",

        data: {
          currentLocation:
            result
              .driver
              .currentLocation,

          activeRideId:
            result
              .currentRide
              ?._id ||
            null
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Driver Warnings
|--------------------------------------------------------------------------
*/

async function getWarnings(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await User
        .findOne({
          _id:
            req.user._id,

          role:
            "driver"
        })
        .select(
          "warnings"
        );

    if (!driver) {
      throw new ApiError(
        404,
        "Driver account not found"
      );
    }

    const warnings = [
      ...(driver.warnings || [])
    ].sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
    );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Driver warnings loaded successfully",

        warnings,

        data: {
          warnings
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Acknowledge Warning
|--------------------------------------------------------------------------
*/

async function acknowledgeWarning(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const warningId =
      String(
        req.params?.warningId ||
          ""
      ).trim();

    if (!warningId) {
      throw new ApiError(
        400,
        "Warning ID required hai"
      );
    }

    const driver =
      await getDriver(req);

    const warning =
      driver.warnings?.id(
        warningId
      );

    if (!warning) {
      throw new ApiError(
        404,
        "Warning nahi mili"
      );
    }

    warning.acknowledged =
      true;

    warning.acknowledgedAt =
      new Date();

    await driver.save();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Warning acknowledge ho gayi.",

        warning,

        data: {
          warning
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Reply To Warning
|--------------------------------------------------------------------------
*/

async function replyToWarning(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const warningId =
      String(
        req.params?.warningId ||
          ""
      ).trim();

    const reply =
      cleanText(
        req.body?.reply,
        500
      );

    if (!reply) {
      throw new ApiError(
        400,
        "Reply required hai"
      );
    }

    const driver =
      await getDriver(req);

    const warning =
      driver.warnings?.id(
        warningId
      );

    if (!warning) {
      throw new ApiError(
        404,
        "Warning nahi mili"
      );
    }

    warning.driverReply =
      reply;

    warning.repliedAt =
      new Date();

    await driver.save();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Reply admin ko bhej diya gaya.",

        warning,

        data: {
          warning
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Current Ride
|--------------------------------------------------------------------------
*/

async function getCurrentRide(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const ride =
      await driverService
        .getCurrentRide(
          req.user._id
        );

    return res
      .status(200)
      .json({
        success: true,

        message:
          ride
            ? "Current ride loaded successfully"
            : "No active ride found",

        data: {
          ride
        }
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| Withdrawal Request
|--------------------------------------------------------------------------
*/

async function requestWithdrawal(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await User.findById(
        req.user._id
      );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver nahi mila."
      });
    }

    const balance =
      Number(driver.wallet?.balance) || 0;

    const amount =
      Number(req.body.amount);

    const upiId =
      String(req.body.upiId || "").trim();

    const bankName =
      String(req.body.bankName || "").trim();

    const accountNumber =
      String(req.body.accountNumber || "").trim();

    const ifsc =
      String(req.body.ifsc || "").trim();

    if (
      !Number.isFinite(amount) ||
      amount < 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal \u20b9100 hai."
      });
    }

    if (amount > balance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Aapka balance \u20b9${balance.toFixed(0)} hai.`
      });
    }

    if (!upiId && !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "UPI ID ya Bank Account number zaroori hai."
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          "wallet.balance": -amount,
          "wallet.pendingAmount": amount
        }
      }
    );

    console.log(
      `[Withdrawal] Driver ${req.user._id} ne \u20b9${amount} withdrawal request ki. UPI: ${upiId || "N/A"}, Bank: ${accountNumber || "N/A"}`
    );

    return res.status(200).json({
      success: true,
      message: `\u20b9${amount} withdrawal request submit ho gayi. Admin 24-48 ghante mein process karega.`,
      data: {
        requestedAmount: amount,
        remainingBalance: balance - amount,
        paymentMethod: upiId ? "upi" : "bank",
        upiId: upiId || null,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        ifsc: ifsc || null
      }
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Onboarding Status
|--------------------------------------------------------------------------
| Driver ko batata hai ki kaunse documents baaki hain aur approval
| request bhej sakte hain ya nahi.
*/

async function getOnboardingStatus(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await getDriver(req);

    const status =
      driver.getOnboardingStatus();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Onboarding status loaded successfully",

        data: {
          onboarding: status,

          vehicle:
            driver
              .driverProfile
              ?.vehicle || {},

          documents:
            driver
              .driverProfile
              ?.documents || []
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Vehicle Details
|--------------------------------------------------------------------------
| Onboarding ke dauraan vehicle info save karne ke liye.
| Commercial vehicle declaration bhi yahin hoti hai.
*/

async function updateVehicleDetails(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await getDriver(req);

    const vehicle =
      driver.driverProfile.vehicle;

    const allowedVehicleTypes = [
      "hatchback",
      "sedan",
      "suv",
      "traveller",
      "bike",
      "other"
    ];

    const allowedPlateTypes = [
      "yellow"
    ];

    const allowedVehicleClasses = [
      "motor_cab",
      "maxi_cab",
      "lmv_taxi",
      "omni_bus",
      "other"
    ];

    const allowedFuelTypes = [
      "petrol",
      "diesel",
      "cng",
      "electric",
      "hybrid",
      "other"
    ];

    if (
      allowedVehicleTypes.includes(
        req.body.vehicleType
      )
    ) {
      vehicle.vehicleType =
        req.body.vehicleType;
    }

    /*
    | HimRideG par sirf commercial (yellow plate) vehicles
    | allowed hain - hamesha yellow set karo.
    */
    vehicle.plateType = "yellow";
    vehicle.isCommercial = true;

    if (
      allowedVehicleClasses.includes(
        req.body.vehicleClass
      )
    ) {
      vehicle.vehicleClass =
        req.body.vehicleClass;
    }

    if (
      allowedFuelTypes.includes(
        req.body.fuelType
      )
    ) {
      vehicle.fuelType =
        req.body.fuelType;
    }

    if (req.body.brand !== undefined) {
      vehicle.brand =
        cleanText(req.body.brand, 100);
    }

    if (req.body.model !== undefined) {
      vehicle.model =
        cleanText(req.body.model, 100);
    }

    if (req.body.color !== undefined) {
      vehicle.color =
        cleanText(req.body.color, 50);
    }

    if (
      req.body.registrationNumber !==
      undefined
    ) {
      const regNumber =
        cleanText(
          req.body.registrationNumber,
          30
        )
          .toUpperCase()
          .replace(/\s+/g, "");

      /*
      | Indian vehicle number format check
      | Example: HP01AB1234, DL3CAB1234
      */
      if (
        regNumber &&
        !/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(
          regNumber
        )
      ) {
        throw new ApiError(
          400,
          "Valid vehicle number enter karo (example: HP01AB1234)"
        );
      }

      vehicle.registrationNumber =
        regNumber;
    }

    const seatingCapacity =
      Number(req.body.seatingCapacity);

    if (
      Number.isInteger(seatingCapacity) &&
      seatingCapacity >= 1 &&
      seatingCapacity <= 30
    ) {
      vehicle.seatingCapacity =
        seatingCapacity;
    }

    const manufacturingYear =
      Number(req.body.manufacturingYear);

    if (
      Number.isInteger(
        manufacturingYear
      ) &&
      manufacturingYear >= 1990 &&
      manufacturingYear <= 2100
    ) {
      vehicle.manufacturingYear =
        manufacturingYear;
    }

    await driver.save();

    const status =
      driver.getOnboardingStatus();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Vehicle details save ho gayi",

        data: {
          vehicle:
            driver
              .driverProfile
              .vehicle,

          onboarding: status
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Submit For Approval
|--------------------------------------------------------------------------
| Sab documents complete hone par hi admin ko request jayegi.
*/

async function submitForApproval(
  req,
  res,
  next
) {
  try {
    ensureDriver(req);

    const driver =
      await getDriver(req);

    const status =
      driver.getOnboardingStatus();

    /*
    | Already approved
    */
    if (status.isApproved) {
      return res
        .status(200)
        .json({
          success: true,

          message:
            "Aapka account already approved hai.",

          data: {
            onboarding: status
          }
        });
    }

    /*
    | Already pending
    */
    if (
      status.approvalStatus ===
      "pending"
    ) {
      return res
        .status(200)
        .json({
          success: true,

          message:
            "Approval request already pending hai. Admin review kar raha hai.",

          data: {
            onboarding: status
          }
        });
    }

    /*
    | Incomplete - request block karo
    */
    if (!status.isComplete) {
      const missingLabels = [
        ...status.missingDocuments.map(
          (item) => item.label
        ),
        ...status.missingVehicleFields.map(
          (item) => item.label
        )
      ];

      throw new ApiError(
        400,
        `Ye cheezein abhi baaki hain: ${missingLabels.join(
          ", "
        )}`
      );
    }

    /*
    | Sab complete - admin ko bhejo
    */
    driver.driverProfile.approvalStatus =
      "pending";

    driver.driverProfile.rejectionReason =
      "";

    driver.driverProfile.submittedAt =
      new Date();

    await driver.save();

    console.log(
      `[Onboarding] Driver ${driver._id} ne approval request submit ki. Commercial: ${status.isCommercial}`
    );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Approval request admin ko bhej di gayi. 24-48 ghante mein review hoga.",

        data: {
          onboarding:
            driver.getOnboardingStatus()
        }
      });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  getOnboardingStatus,
  updateVehicleDetails,
  submitForApproval,
  getDashboard,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadDocument,
  downloadDocument,
  goOnline,
  goOffline,
  becomeAvailable,
  becomeBusy,
  updateLocation,
  getWarnings,
  acknowledgeWarning,
  replyToWarning,
  getCurrentRide,
  requestWithdrawal
};