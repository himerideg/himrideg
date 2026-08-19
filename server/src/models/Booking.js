const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Geo Point Schema (MongoDB GeoJSON)
|--------------------------------------------------------------------------
*/

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },

    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            Number.isFinite(value[0]) &&
            Number.isFinite(value[1])
          );
        },
        message:
          "GeoJSON coordinates must contain [longitude, latitude]"
      }
    }
  },
  {
    _id: false
  }
);

/*
|--------------------------------------------------------------------------
| Coordinates Schema
|--------------------------------------------------------------------------
*/

const coordinatesSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },

    geo: {
      type: geoPointSchema,
      required: true
    }
  },
  {
    _id: false
  }
);

/*
|--------------------------------------------------------------------------
| Location Schema
|--------------------------------------------------------------------------
*/

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    landmark: {
      type: String,
      trim: true,
      default: ""
    },

    city: {
      type: String,
      trim: true,
      default: ""
    },

    state: {
      type: String,
      trim: true,
      default: ""
    },

    postalCode: {
      type: String,
      trim: true,
      default: ""
    },

    coordinates: {
      type: coordinatesSchema,
      required: true
    }
  },
  {
    _id: false
  }
);

/*
|--------------------------------------------------------------------------
| Ride OTP
|--------------------------------------------------------------------------
*/

const rideOtpSchema = new mongoose.Schema(
  {
    otpHash: {
      type: String,
      select: false,
      default: null
    },

    expiresAt: {
      type: Date,
      default: null
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1
    },

    verified: {
      type: Boolean,
      default: false
    },

    verifiedAt: {
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
| Fare Breakdown
|--------------------------------------------------------------------------
*/

const fareBreakdownSchema = new mongoose.Schema(
  {
    baseFare: {
      type: Number,
      default: 0
    },

    distanceFare: {
      type: Number,
      default: 0
    },

    timeFare: {
      type: Number,
      default: 0
    },

    waitingCharge: {
      type: Number,
      default: 0
    },

    tollCharge: {
      type: Number,
      default: 0
    },

    parkingCharge: {
      type: Number,
      default: 0
    },

    nightCharge: {
      type: Number,
      default: 0
    },

    surgeMultiplier: {
      type: Number,
      default: 1
    },

    surgeAmount: {
      type: Number,
      default: 0
    },

    couponDiscount: {
      type: Number,
      default: 0
    },

    walletUsed: {
      type: Number,
      default: 0
    },

    platformFee: {
      type: Number,
      default: 0
    },

    taxes: {
      type: Number,
      default: 0
    },

    estimatedFare: {
      type: Number,
      default: 0
    },

    finalFare: {
      type: Number,
      default: 0
    }
  },
  {
    _id: false
  }
);

/*
|--------------------------------------------------------------------------
| Payment
|--------------------------------------------------------------------------
*/

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: [
        "cash",
        "online",
        "wallet"
      ],
      default: "cash"
    },


    /* ADD-ONLY: restored advanced fare/payment compatibility fields */
    driverFinalFareProposal: {
      type: Number,
      default: null,
      min: 0
    },


    driverFinalFareProposedAt: {
      type: Date,
      default: null
    },


    finalFareRejectedAt: {
      type: Date,
      default: null
    },


    driverReleaseHistory: {
      type: [
        {
          driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
          },
          reason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
          },
          releasedAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },


    paymentTiming: {
      type: String,
      enum: [
        "pay_now",
        "pay_later",
        "scheduled"
      ],
      default: "pay_later",
      index: true
    },


    paymentPlan: {
      type: String,
      enum: [
        "online_after_ride",
        "advance",
        "scheduled",
        null
      ],
      default: null,
      index: true
    },


    paymentPlanSelectedAt: {
      type: Date,
      default: null
    },


    paymentScheduledAt: {
      type: Date,
      default: null
    },


    paymentChoiceAfterRide: {
      type: String,
      enum: [
        "online",
        "cash",
        null
      ],
      default: null
    },


    settlementStatus: {
      type: String,
      enum: [
        "not_started",
        "pending",
        "transferred",
        "wallet_fallback",
        "cash_commission_debited",
        "cash_commission_due",
        "failed"
      ],
      default: "not_started",
      index: true
    },


    settlementReference: {
      type: String,
      default: null,
      trim: true
    },


    settlementError: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000
    },


    settledAt: {
      type: Date,
      default: null
    },


    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    transactionId: {
      type: String,
      default: ""
    },

    gateway: {
      type: String,
      default: ""
    },

    paidAt: {
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
| Dispatch Driver
|--------------------------------------------------------------------------
*/

const dispatchDriverSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    notifiedAt: {
      type: Date,
      default: Date.now
    },

    expiresAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "expired",
        "ignored"
      ],
      default: "pending"
    },

    distanceKm: {
      type: Number,
      default: 0
    },

    etaMinutes: {
      type: Number,
      default: 0
    }
  },
  {
    _id: true
  }
);

/*
|--------------------------------------------------------------------------
| Cancel Information
|--------------------------------------------------------------------------
*/

const cancellationSchema = new mongoose.Schema(
  {
    cancelledBy: {
      type: String,
      enum: [
        "customer",
        "driver",
        "admin",
        null
      ],
      default: null
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    charge: {
      type: Number,
      default: 0
    },

    cancelledAt: {
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
| Driver Live Location
|--------------------------------------------------------------------------
*/

const driverLocationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },

    geo: {
      type: geoPointSchema,
      default: null
    },

    heading: {
      type: Number,
      default: null
    },

    speed: {
      type: Number,
      default: null
    },

    accuracy: {
      type: Number,
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
| Rating
|--------------------------------------------------------------------------
*/

const ratingSchema = new mongoose.Schema(
  {
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    customerReview: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    driverRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    driverReview: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    _id: false
  }
);

/*
|--------------------------------------------------------------------------
| Booking Schema
|--------------------------------------------------------------------------
*/

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    pickup: {
      type: locationSchema,
      required: true
    },

    dropoff: {
      type: locationSchema,
      required: true
    },

    travelDate: {
      type: Date,
      required: true,
      index: true
    },

    passengers: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },

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
      default: "hatchback",
      index: true
    },

    distanceKm: {
      type: Number,
      required: true,
      min: 0
    },

    estimatedDurationMinutes: {
      type: Number,
      default: 0
    },

    actualDistanceKm: {
      type: Number,
      default: 0
    },

    actualDurationMinutes: {
      type: Number,
      default: 0
    },

    routePolyline: {
      type: String,
      default: ""
    },

    fare: {
      type: fareBreakdownSchema,
      default: () => ({})
    },

    payment: {
      type: paymentSchema,
      default: () => ({})
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash"
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    razorpayOrderId: {
      type: String,
      default: null
    },

    razorpayPaymentId: {
      type: String,
      default: null
    },

    razorpaySignature: {
      type: String,
      default: null,
      select: false
    },

    paidAt: {
      type: Date,
      default: null
    },

    paymentFailedAt: {
      type: Date,
      default: null
    },

    paymentFailureReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    paymentAttemptCount: {
      type: Number,
      min: 0,
      default: 0
    },

    cashSelectedAt: {
      type: Date,
      default: null
    },

    walletSettlementStatus: {
      type: String,
      enum: ["not_settled", "settling", "settled"],
      default: "not_settled",
      index: true
    },

    walletSettledAt: {
      type: Date,
      default: null
    },

    driverOfferedFare: {
      type: Number,
      default: null,
      min: 0
    },

    customerCounterFare: {
      type: Number,
      default: null,
      min: 0
    },

    finalFare: {
      type: Number,
      default: null,
      min: 0
    },

    fareStatus: {
      type: String,
      enum: [
        "not_offered",
        "driver_offered",
        "customer_countered",
        "driver_final",
        "fare_accepted",
        "fare_rejected"
      ],
      default: "not_offered",
      index: true
    },

    fareOfferedBy: {
      type: String,
      enum: [
        "driver",
        "customer",
        null
      ],
      default: null
    },

    fareOfferCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 6
    },

    fareOfferedAt: {
      type: Date,
      default: null
    },

    fareAcceptedAt: {
      type: Date,
      default: null
    },

    platformCommissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },

    platformCommissionAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    driverPayableAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "searching_driver",
        "driver_assigned",
        "accepted",
        "fare_offered",
        "negotiating",
        "fare_accepted",
        "driver_arriving",
        "driver_arrived",
        "started",
        "completed",
        "cancelled",
        "expired"
      ],
      default: "pending",
      index: true
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    rideStartOtp: {
      type: rideOtpSchema,
      default: () => ({})
    },

    dispatchQueue: {
      type: [dispatchDriverSchema],
      default: []
    },

    rejectedDrivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    driverLocation: {
      type: driverLocationSchema,
      default: () => ({})
    },

    cancellation: {
      type: cancellationSchema,
      default: () => ({})
    },

    rating: {
      type: ratingSchema,
      default: () => ({})
    },

    acceptedAt: {
      type: Date,
      default: null
    },

    driverArrivedAt: {
      type: Date,
      default: null
    },

    startedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    expiresAt: {
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
| GeoJSON Sync
|--------------------------------------------------------------------------
*/

bookingSchema.pre("validate", function () {
  const syncGeo = (location) => {
    if (
      !location ||
      !location.coordinates
    ) {
      return;
    }

    const {
      latitude,
      longitude
    } = location.coordinates;

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      location.coordinates.geo = {
        type: "Point",
        coordinates: [
          longitude,
          latitude
        ]
      };
    }
  };

  syncGeo(this.pickup);
  syncGeo(this.dropoff);

  if (
    this.driverLocation &&
    Number.isFinite(
      this.driverLocation.latitude
    ) &&
    Number.isFinite(
      this.driverLocation.longitude
    )
  ) {
    this.driverLocation.geo = {
      type: "Point",
      coordinates: [
        this.driverLocation.longitude,
        this.driverLocation.latitude
      ]
    };
  }
});

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

// Customer History
bookingSchema.index({
  customer: 1,
  createdAt: -1
});

// Driver History
bookingSchema.index({
  driver: 1,
  createdAt: -1
});

// Driver Active Ride
bookingSchema.index({
  driver: 1,
  status: 1
});

// Travel Date
bookingSchema.index({
  travelDate: 1,
  status: 1
});

// Dispatch Engine
bookingSchema.index({
  status: 1,
  vehicleType: 1,
  createdAt: 1
});

// Customer Active Ride
bookingSchema.index({
  customer: 1,
  status: 1
});

// Geo Search Pickup
bookingSchema.index({
  "pickup.coordinates.geo": "2dsphere"
});

// Geo Search Drop
bookingSchema.index({
  "dropoff.coordinates.geo": "2dsphere"
});

// Driver Live Location
bookingSchema.index({
  "driverLocation.geo": "2dsphere"
});

// Expiry
bookingSchema.index({
  expiresAt: 1
});

/*
|--------------------------------------------------------------------------
| Virtuals
|--------------------------------------------------------------------------
*/

bookingSchema.virtual("isActiveRide").get(function () {
  return [
    "pending",
    "searching_driver",
    "driver_assigned",
    "accepted",
    "fare_offered",
    "negotiating",
    "fare_accepted",
    "driver_arriving",
    "driver_arrived",
    "started"
  ].includes(this.status);
});

bookingSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

bookingSchema.virtual("isCancelled").get(function () {
  return this.status === "cancelled";
});

/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
*/

bookingSchema.methods.canStartRide = function () {
  return (
    this.status === "driver_arrived" &&
    this.rideStartOtp &&
    this.rideStartOtp.verified === true
  );
};

bookingSchema.methods.canCompleteRide = function () {
  return this.status === "started";
};

bookingSchema.methods.isExpired = function () {
  if (!this.expiresAt) {
    return false;
  }

  return new Date() > this.expiresAt;
};

bookingSchema.methods.assignDriver = function (
  driverId
) {
  this.driver = driverId;
  this.status = "driver_assigned";
  this.acceptedAt = new Date();
};

bookingSchema.methods.markDriverArrived =
  function () {
    this.status = "driver_arrived";
    this.driverArrivedAt = new Date();
  };

bookingSchema.methods.startRide = function () {
  this.status = "started";
  this.startedAt = new Date();
};

bookingSchema.methods.completeRide = function () {
  this.status = "completed";
  this.completedAt = new Date();
};

bookingSchema.methods.cancelRide = function (
  cancelledBy,
  reason = ""
) {
  this.status = "cancelled";
  this.cancellation.cancelledBy =
    cancelledBy;
  this.cancellation.reason = reason;
  this.cancellation.cancelledAt =
    new Date();
};

bookingSchema.methods.addRejectedDriver =
  function (driverId) {
    const exists =
      this.rejectedDrivers.some(
        (id) =>
          id.toString() ===
          driverId.toString()
      );

    if (!exists) {
      this.rejectedDrivers.push(
        driverId
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);