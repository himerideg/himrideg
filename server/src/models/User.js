const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/*
|--------------------------------------------------------------------------
| Driver Document Schema
|--------------------------------------------------------------------------
*/

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: [
        "driving_license",
        "aadhaar",
        "pan",
        "vehicle_rc",
        "insurance",
        "pollution_certificate",
        "permit",
        "fitness_certificate",
        "profile_photo",
        "vehicle_photo",
        "other"
      ],
      default: "other",
      trim: true
    },

    documentNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ""
    },

    nameOnDocument: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    documentUrl: {
      type: String,
      trim: true,
      default: ""
    },

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected"
      ],
      default: "pending"
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    expiryDate: {
      type: Date,
      default: null
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Vehicle Schema
|--------------------------------------------------------------------------
*/

const vehicleSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      enum: [
        "hatchback",
        "sedan",
        "suv",
        "traveller",
        "bike",
        "other"
      ],
      default: "hatchback"
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    model: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    color: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ""
    },

    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 30,
      default: ""
    },

    manufacturingYear: {
      type: Number,
      min: 1990,
      max: 2100,
      default: null
    },

    fuelType: {
      type: String,
      enum: [
        "petrol",
        "diesel",
        "cng",
        "electric",
        "hybrid",
        "other"
      ],
      default: "petrol"
    },

    seatingCapacity: {
      type: Number,
      min: 1,
      max: 30,
      default: 4
    },

    /*
    |------------------------------------------------------------------
    | Commercial Vehicle Fields
    |------------------------------------------------------------------
    | India mein commercial vehicle ki pehchaan YELLOW number plate se
    | hoti hai (black text on yellow background). RC par "Vehicle Class"
    | Motor Cab / Maxi Cab / LMV-Taxi likha hota hai.
    |
    | Driver khud declare karega, phir Admin RC document dekh kar verify
    | karega. Sirf commercial (yellow plate) vehicles hi approve hongi.
    */

    plateType: {
      type: String,
      enum: [
        "yellow"
      ],
      default: "yellow"
    },

    vehicleClass: {
      type: String,
      enum: [
        "motor_cab",
        "maxi_cab",
        "lmv_taxi",
        "omni_bus",
        "other"
      ],
      default: "motor_cab"
    },

    isCommercial: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: false
  }
);

/*
|--------------------------------------------------------------------------
| Bank Details Schema
|--------------------------------------------------------------------------
*/

const bankDetailsSchema =
  new mongoose.Schema(
    {
      accountHolderName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      accountNumber: {
        type: String,
        trim: true,
        maxlength: 30,
        default: ""
      },

      bankName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 20,
        default: ""
      },

      upiId: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      verified: {
        type: Boolean,
        default: false
      }
    },
    {
      _id: false
    }
  );

/*
|--------------------------------------------------------------------------
| Wallet Schema
|--------------------------------------------------------------------------
*/

const walletSchema =
  new mongoose.Schema(
    {
      balance: {
        type: Number,
        min: 0,
        default: 0
      },

      totalEarned: {
        type: Number,
        min: 0,
        default: 0
      },

      totalWithdrawn: {
        type: Number,
        min: 0,
        default: 0
      },

      pendingAmount: {
        type: Number,
        min: 0,
        default: 0
      },

      /*
      |--------------------------------------------------------------------------
      | Launch V3 Cash Commission
      |--------------------------------------------------------------------------
      |
      | Cash ride me customer full fare driver ko deta hai.
      | Company commission wallet balance se deduct hota hai.
      | Agar balance kam ho to shortfall commissionDue me track hota hai.
      |
      */
      commissionDue: {
        type: Number,
        min: 0,
        default: 0
      },

      totalCommissionPaid: {
        type: Number,
        min: 0,
        default: 0
      },

      totalOnlineTransferred: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    {
      _id: false
    }
  );

/*
|--------------------------------------------------------------------------
| Current Location Schema
|--------------------------------------------------------------------------
*/

const currentLocationSchema =
  new mongoose.Schema(
    {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null
      },

      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },

        coordinates: {
          type: [Number],
          default: undefined
        }
      },

      heading: {
        type: Number,
        min: 0,
        max: 360,
        default: null
      },

      speed: {
        type: Number,
        min: 0,
        default: null
      },

      accuracy: {
        type: Number,
        min: 0,
        default: null
      },

      updatedAt: {
        type: Date,
        default: null
      }
    },
    {
      _id: false
    }
  );

/*
|--------------------------------------------------------------------------
| Driver Profile Schema
|--------------------------------------------------------------------------
*/

const driverProfileSchema =
  new mongoose.Schema(
    {
      legalName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      // NEW: Admin verifies & locks legal name after Aadhaar check
      legalNameVerified: {
        type: Boolean,
        default: false
      },

      legalNameVerifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },

      legalNameVerifiedAt: {
        type: Date,
        default: null
      },

      licenseNumber: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 50,
        default: ""
      },

      licenseExpiry: {
        type: Date,
        default: null
      },

      dateOfBirth: {
        type: Date,
        default: null
      },

      gender: {
        type: String,
        enum: [
          "",
          "male",
          "female",
          "other"
        ],
        default: ""
      },

      address: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
      },

      city: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      state: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      pincode: {
        type: String,
        trim: true,
        maxlength: 10,
        default: ""
      },

      vehicle: {
        type: vehicleSchema,
        default: () => ({})
      },

      documents: {
        type: [documentSchema],
        default: []
      },

      bankDetails: {
        type: bankDetailsSchema,
        default: () => ({})
      },

      /*
      |--------------------------------------------------------------------------
      | Razorpay Route Linked Account
      |--------------------------------------------------------------------------
      |
      | Online ride payment ka driver share automatically linked account
      | ko transfer karne ke liye.
      |
      */
      razorpayLinkedAccountId: {
        type: String,
        trim: true,
        default: "",
        index: true
      },

      razorpayRouteStatus: {
        type: String,
        enum: [
          "not_created",
          "pending",
          "active",
          "failed"
        ],
        default: "not_created"
      },

      razorpayRouteLastError: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
      },

      razorpayRouteUpdatedAt: {
        type: Date,
        default: null
      },

      approvalStatus: {
        type: String,
        enum: [
          "not_submitted",
          "pending",
          "approved",
          "rejected",
          "suspended"
        ],
        default: "not_submitted",
        index: false
      },

      isApproved: {
        type: Boolean,
        default: false,
        index: false
      },

      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
      },

      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },

      approvedAt: {
        type: Date,
        default: null
      },

      termsAccepted: {
        type: Boolean,
        default: false
      },

      termsAcceptedAt: {
        type: Date,
        default: null
      },

      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },

      ratingCount: {
        type: Number,
        min: 0,
        default: 0
      },

      totalRides: {
        type: Number,
        min: 0,
        default: 0
      },

      completedRides: {
        type: Number,
        min: 0,
        default: 0
      },

      cancelledRides: {
        type: Number,
        min: 0,
        default: 0
      },

      acceptanceRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
      },

      cancellationRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },

      commissionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 10
      }
    },
    {
      _id: false
    }
  );

/*
|--------------------------------------------------------------------------
| Driver Warning Schema
|--------------------------------------------------------------------------
*/

const driverWarningSchema =
  new mongoose.Schema(
    {
      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },

      reason: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
      },

      level: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
          "final"
        ],
        default: "medium"
      },

      acknowledged: {
        type: Boolean,
        default: false
      },

      acknowledgedAt: {
        type: Date,
        default: null
      },

      driverReply: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
      },

      repliedAt: {
        type: Date,
        default: null
      },

      issuedBy: {
        type:
          mongoose.Schema
            .Types.ObjectId,
        ref: "Admin",
        default: null
      }
    },
    {
      _id: true,
      timestamps: true
    }
  );

/*
|--------------------------------------------------------------------------
| Unblock Request Schema
|--------------------------------------------------------------------------
*/

const unblockRequestSchema =
  new mongoose.Schema(
    {
      status: {
        type: String,
        enum: [
          "none",
          "pending",
          "approved",
          "rejected"
        ],
        default: "none"
      },

      message: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
      },

      requestedAt: {
        type: Date,
        default: null
      },

      adminNote: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
      },

      reviewedAt: {
        type: Date,
        default: null
      },

      reviewedBy: {
        type:
          mongoose.Schema
            .Types.ObjectId,
        ref: "Admin",
        default: null
      }
    },
    {
      _id: false
    }
  );

/*
|--------------------------------------------------------------------------
| Main User Schema
|--------------------------------------------------------------------------
*/

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
      },

      phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 15
      },

      alternativePhone: {
        type: String,
        trim: true,
        maxlength: 15,
        default: ""
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 150,
        default: undefined
      },

      /*
      |------------------------------------------------------------------
      | Google Identity Link
      |------------------------------------------------------------------
      | `sub` Google account ka stable unique identifier hai. Email ko
      | primary Google identifier nahi banaya gaya. Role ke saath link
      | hota hai taaki Customer aur Driver flows separate rahen.
      */
      googleId: {
        type: String,
        trim: true,
        maxlength: 255,
        default: undefined
      },

      googleEmail: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 150,
        default: undefined
      },

      googleLinkedAt: {
        type: Date,
        default: null
      },

      /*
      | Google direct login ke baad first-time Basic Info completion flag.
      | Password Google accounts ke liye required nahi hai.
      */
      googleBasicInfoCompleted: {
        type: Boolean,
        default: false
      },

      password: {
        type: String,
        select: false,
        default: ""
      },

      role: {
        type: String,
        enum: [
          "customer",
          "driver",
          "admin"
        ],
        default: "customer",
        index: true
      },

      isPhoneVerified: {
        type: Boolean,
        default: false
      },

      isEmailVerified: {
        type: Boolean,
        default: false
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true
      },

      accountStatus: {
        type: String,
        enum: [
          "active",
          "inactive",
          "suspended",
          "blocked",
          "deleted"
        ],
        default: "active",
        index: true
      },

      profileImage: {
        type: String,
        trim: true,
        default: ""
      },

      warnings: {
        type: [
          driverWarningSchema
        ],
        default: []
      },

      blockReason: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
      },

      blockedAt: {
        type: Date,
        default: null
      },

      blockedBy: {
        type:
          mongoose.Schema
            .Types.ObjectId,
        ref: "Admin",
        default: null
      },

      unblockRequest: {
        type:
          unblockRequestSchema,
        default: () => ({})
      },

      driverProfile: {
        type:
          driverProfileSchema,
        default: () => ({})
      },

      wallet: {
        type: walletSchema,
        default: () => ({})
      },

      isOnline: {
        type: Boolean,
        default: false,
        index: true
      },

      isAvailable: {
        type: Boolean,
        default: false,
        index: true
      },

      currentRide: {
        type:
          mongoose.Schema
            .Types.ObjectId,
        ref: "Booking",
        default: null,
        index: true
      },

      currentLocation: {
        type:
          currentLocationSchema,
        default: () => ({})
      },

      socketId: {
        type: String,
        trim: true,
        default: null
      },

      /*
      | Refresh token ka SHA-256 hash.
      | Iske bina session refresh nahi ho sakta aur
      | user access token expire hote hi logout ho jata hai.
      */
      refreshTokenHash: {
        type: String,
        default: null,
        select: false
      },

      fcmTokens: {
        type: [String],
        default: []
      },

      loginAttempts: {
        type: Number,
        min: 0,
        default: 0
      },

      accountLockedUntil: {
        type: Date,
        default: null
      },

      lastLoginAt: {
        type: Date,
        default: null
      },

      lastSeenAt: {
        type: Date,
        default: null
      },

      deletedAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

/*
|--------------------------------------------------------------------------
| Password Hashing
|--------------------------------------------------------------------------
*/

userSchema.pre(
  "save",
  async function () {
    if (
      !this.isModified(
        "password"
      ) ||
      !this.password
    ) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        12
      );
  }
);

/*
|--------------------------------------------------------------------------
| Location Synchronization
|--------------------------------------------------------------------------
*/

userSchema.pre(
  "save",
  function () {
    const location =
      this.currentLocation;

    if (!location) {
      return;
    }

    const latitude =
      location.latitude;

    const longitude =
      location.longitude;

    const hasValidCoordinates =
      Number.isFinite(
        latitude
      ) &&
      Number.isFinite(
        longitude
      ) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    if (
      hasValidCoordinates
    ) {
      location.geo = {
        type: "Point",
        coordinates: [
          longitude,
          latitude
        ]
      };

      if (
        !location.updatedAt
      ) {
        location.updatedAt =
          new Date();
      }
    } else {
      location.geo =
        undefined;
    }
  }
);

/*
|--------------------------------------------------------------------------
| Password Comparison
|--------------------------------------------------------------------------
*/

userSchema.methods
  .comparePassword =
  async function (
    candidatePassword
  ) {
    if (
      !candidatePassword ||
      !this.password
    ) {
      return false;
    }

    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

/*
|--------------------------------------------------------------------------
| Safe User Object
|--------------------------------------------------------------------------
*/

userSchema.methods
  .toSafeObject =
  function () {
    const userObject =
      this.toObject({
        virtuals: true
      });

    delete userObject.password;
    delete userObject.googleId;
    delete userObject.__v;
    delete userObject.socketId;
    delete userObject.fcmTokens;
    delete userObject.loginAttempts;
    delete userObject
      .accountLockedUntil;
    delete userObject.deletedAt;

    return userObject;
  };

/*
|--------------------------------------------------------------------------
| Driver Virtuals
|--------------------------------------------------------------------------
*/

userSchema.virtual(
  "approved"
).get(function () {
  return Boolean(
    this.driverProfile
      ?.isApproved
  );
});

userSchema.virtual(
  "vehicleType"
).get(function () {
  return (
    this.driverProfile
      ?.vehicle
      ?.vehicleType ||
    ""
  );
});

userSchema.virtual(
  "vehicleNumber"
).get(function () {
  return (
    this.driverProfile
      ?.vehicle
      ?.registrationNumber ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| Driver Onboarding Requirements
|--------------------------------------------------------------------------
| Driver approval ke liye ye documents COMPULSORY hain.
| Jab tak ye sab upload nahi honge, admin ko approval request nahi jayegi.
*/

const REQUIRED_DRIVER_DOCUMENTS = [
  {
    type: "aadhaar",
    label: "Aadhaar Card"
  },
  {
    type: "driving_license",
    label: "Driving Licence"
  },
  {
    type: "vehicle_rc",
    label: "Vehicle RC"
  },
  {
    type: "vehicle_photo",
    label: "Vehicle Photo (number plate visible)"
  }
];

/*
| Commercial vehicles (yellow plate) ke liye extra documents
*/

const COMMERCIAL_EXTRA_DOCUMENTS = [
  {
    type: "permit",
    label: "Commercial Permit"
  }
];

userSchema.methods
  .getOnboardingStatus =
  function () {
    const profile =
      this.driverProfile || {};

    const vehicle =
      profile.vehicle || {};

    const documents =
      profile.documents || [];

    /*
    | HimRideG par sirf commercial (yellow plate) vehicles
    | allowed hain, isliye commercial docs hamesha required hain.
    */
    const isCommercial = true;

    const requiredDocs = [
      ...REQUIRED_DRIVER_DOCUMENTS,
      ...COMMERCIAL_EXTRA_DOCUMENTS
    ];

    /*
    | Har required document check karo
    */
    const documentChecklist =
      requiredDocs.map((item) => {
        const uploaded =
          documents.find(
            (doc) =>
              doc.documentType ===
                item.type &&
              doc.documentUrl
          );

        return {
          type: item.type,
          label: item.label,
          uploaded: Boolean(uploaded),
          status:
            uploaded?.verificationStatus ||
            "not_uploaded",
          rejectionReason:
            uploaded?.rejectionReason || ""
        };
      });

    /*
    | Vehicle details bhi compulsory hain
    */
    const vehicleChecklist = [
      {
        field: "registrationNumber",
        label: "Vehicle Number",
        filled: Boolean(
          String(
            vehicle.registrationNumber || ""
          ).trim()
        )
      },
      {
        field: "brand",
        label: "Vehicle Brand",
        filled: Boolean(
          String(vehicle.brand || "").trim()
        )
      },
      {
        field: "model",
        label: "Vehicle Model",
        filled: Boolean(
          String(vehicle.model || "").trim()
        )
      }
    ];

    const missingDocuments =
      documentChecklist.filter(
        (item) => !item.uploaded
      );

    const missingVehicleFields =
      vehicleChecklist.filter(
        (item) => !item.filled
      );

    const rejectedDocuments =
      documentChecklist.filter(
        (item) =>
          item.status === "rejected"
      );

    const isComplete =
      missingDocuments.length === 0 &&
      missingVehicleFields.length === 0;

    /*
    | Progress percentage
    */
    const totalItems =
      documentChecklist.length +
      vehicleChecklist.length;

    const doneItems =
      totalItems -
      missingDocuments.length -
      missingVehicleFields.length;

    const progressPercent =
      totalItems > 0
        ? Math.round(
            (doneItems / totalItems) * 100
          )
        : 0;

    return {
      isCommercial,
      plateType:
        vehicle.plateType || "yellow",
      vehicleClass:
        vehicle.vehicleClass || "motor_cab",
      documentChecklist,
      vehicleChecklist,
      missingDocuments,
      missingVehicleFields,
      rejectedDocuments,
      isComplete,
      progressPercent,
      approvalStatus:
        profile.approvalStatus ||
        "not_submitted",
      isApproved: Boolean(
        profile.isApproved
      ),
      rejectionReason:
        profile.rejectionReason || ""
    };
  };

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

userSchema.index(
  {
    googleId: 1,
    role: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      googleId: {
        $type: "string"
      }
    }
  }
);

userSchema.index({
  role: 1,
  accountStatus: 1
});

userSchema.index({
  role: 1,
  isOnline: 1,
  isAvailable: 1
});

userSchema.index({
  "driverProfile.approvalStatus":
    1
});

userSchema.index({
  "driverProfile.isApproved":
    1
});

userSchema.index({
  "currentLocation.geo":
    "2dsphere"
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );