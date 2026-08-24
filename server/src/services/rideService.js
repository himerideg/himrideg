const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Booking = require("../models/Booking");
const User = require("../models/User");
const { sendPushToUser } = require("./pushNotificationService");

const socketEvents = require("./socketEventService");
const walletService = require("./walletService");

const {
  emitRideRequest,
  emitRideRequestCancelled,
  emitRideAccepted,
  emitRideRejected,
  emitDriverArriving,
  emitDriverArrived,
  emitRideOtpGenerated,
  emitRideOtpVerified,
  emitRideStarted,
  emitRideCompleted,
  emitRideCancelled,
  emitRideStatusUpdated,
  emitDriverLocationUpdated
} = socketEvents;

const DEFAULT_DRIVER_SEARCH_RADIUS_METERS = 15000;
const DEFAULT_DRIVER_LIMIT = 10;
const DEFAULT_DISPATCH_TIMEOUT_SECONDS = 30;
const DEFAULT_RIDE_EXPIRY_MINUTES = 15;
const DEFAULT_OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

/* Cash commission due ledger me rahega, par next ride acceptance ko block nahi karega. */
const COMMISSION_DUE_BLOCKS_NEW_RIDES = false;

const ACTIVE_RIDE_STATUSES = [
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
];

const CUSTOMER_CANCELLABLE_STATUSES = [
  "pending",
  "searching_driver",
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived"
];

const DRIVER_CANCELLABLE_STATUSES = [
  "driver_assigned",
  "accepted",
  "fare_offered",
  "negotiating",
  "fare_accepted",
  "driver_arriving",
  "driver_arrived"
];

class RideServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "RIDE_SERVICE_ERROR"
  ) {
    super(message);

    this.name = "RideServiceError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

function safeEmit(emitter, payload) {
  try {
    if (typeof emitter === "function") {
      emitter(payload);
    }
  } catch (error) {
    console.error(
      "[RideService socket error]",
      error.message
    );
  }
}

function objectId(value, fieldName = "ID") {
  if (
    !value ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new RideServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_OBJECT_ID"
    );
  }

  return new mongoose.Types.ObjectId(value);
}

function text(value, fallback = "") {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return String(value).trim();
}

function numberValue(
  value,
  fieldName,
  {
    required = false,
    minimum = null,
    maximum = null,
    fallback = null
  } = {}
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (required) {
      throw new RideServiceError(
        `${fieldName} is required`,
        400,
        "INVALID_NUMBER"
      );
    }

    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new RideServiceError(
      `${fieldName} must be a valid number`,
      400,
      "INVALID_NUMBER"
    );
  }

  if (
    minimum !== null &&
    parsed < minimum
  ) {
    throw new RideServiceError(
      `${fieldName} must be at least ${minimum}`,
      400,
      "NUMBER_TOO_SMALL"
    );
  }

  if (
    maximum !== null &&
    parsed > maximum
  ) {
    throw new RideServiceError(
      `${fieldName} cannot exceed ${maximum}`,
      400,
      "NUMBER_TOO_LARGE"
    );
  }

  return parsed;
}

function addMinutes(date, minutes) {
  return new Date(
    date.getTime() + minutes * 60 * 1000
  );
}

function addSeconds(date, seconds) {
  return new Date(
    date.getTime() + seconds * 1000
  );
}

function generateOtp(length = 4) {
  const minimum = 10 ** (length - 1);
  const maximum = 10 ** length;

  return crypto
    .randomInt(minimum, maximum)
    .toString();
}

async function generateBookingNumber() {
  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const timePart = Date.now()
      .toString(36)
      .toUpperCase();

    const randomPart = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    const bookingNumber =
      `HRG-${timePart}-${randomPart}`;

    const exists = await Booking.exists({
      bookingNumber
    });

    if (!exists) {
      return bookingNumber;
    }
  }

  throw new RideServiceError(
    "Could not generate booking number",
    500,
    "BOOKING_NUMBER_FAILED"
  );
}

function normalizeLocation(
  value,
  fallbackCoordinates,
  fieldName
) {
  const source =
    value &&
    typeof value === "object"
      ? value
      : {
          address: value
        };

  const coordinates =
    source.coordinates &&
    typeof source.coordinates === "object"
      ? source.coordinates
      : fallbackCoordinates &&
          typeof fallbackCoordinates ===
            "object"
        ? fallbackCoordinates
        : {};

  const latitude = numberValue(
    coordinates.latitude ??
      coordinates.lat ??
      source.latitude ??
      source.lat,
    `${fieldName} latitude`,
    {
      required: true,
      minimum: -90,
      maximum: 90
    }
  );

  const longitude = numberValue(
    coordinates.longitude ??
      coordinates.lng ??
      coordinates.lon ??
      source.longitude ??
      source.lng ??
      source.lon,
    `${fieldName} longitude`,
    {
      required: true,
      minimum: -180,
      maximum: 180
    }
  );

  const address = text(
    source.address ??
      source.label ??
      source.name
  );

  if (!address) {
    throw new RideServiceError(
      `${fieldName} address is required`,
      400,
      "LOCATION_ADDRESS_REQUIRED"
    );
  }

  return {
    address,
    landmark: text(source.landmark),
    city: text(source.city),
    state: text(source.state),

    postalCode: text(
      source.postalCode ??
        source.pincode
    ),

    coordinates: {
      latitude,
      longitude,

      geo: {
        type: "Point",
        coordinates: [
          longitude,
          latitude
        ]
      }
    }
  };
}

/*
|--------------------------------------------------------------------------
| Haversine Distance
|--------------------------------------------------------------------------
| Do coordinates ke beech ki seedhi doori (km mein).
| Client se distance na aaye toh yeh fallback use hota hai.
| Road distance seedhi doori se zyada hoti hai, isliye 1.35x
| ka realistic multiplier lagaya hai (Himachal ki pahaadi sadko ke liye).
*/

function haversineDistanceKm(
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude
) {
  const EARTH_RADIUS_KM = 6371;

  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const deltaLatitude = toRadians(
    toLatitude - fromLatitude
  );

  const deltaLongitude = toRadians(
    toLongitude - fromLongitude
  );

  const a =
    Math.sin(deltaLatitude / 2) *
      Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  const straightLineKm =
    EARTH_RADIUS_KM * c;

  /*
  | Road factor - pahaadi raste seedhe nahi hote
  */
  const ROAD_FACTOR = 1.35;

  return (
    Math.round(
      straightLineKm * ROAD_FACTOR * 10
    ) / 10
  );
}

function pickupGeo(booking) {
  const geo =
    booking?.pickup
      ?.coordinates
      ?.geo;

  if (
    !geo ||
    geo.type !== "Point" ||
    !Array.isArray(
      geo.coordinates
    ) ||
    geo.coordinates.length !== 2
  ) {
    throw new RideServiceError(
      "Pickup coordinates are invalid",
      400,
      "INVALID_PICKUP_COORDINATES"
    );
  }

  return geo;
}

async function getBookingOrThrow(
  bookingId,
  {
    includeOtpHash = false,
    populate = false
  } = {}
) {
  let query = Booking.findById(
    objectId(
      bookingId,
      "Booking ID"
    )
  );

  if (includeOtpHash) {
    query = query.select(
      "+rideStartOtp.otpHash"
    );
  }

  if (populate) {
    query = query
      .populate(
        "customer",
        "name phone profileImage role"
      )
      .populate(
        "driver",
        [
          "name",
          "phone",
          "profileImage",
          "role",
          "driverProfile",
          "currentLocation",
          "isOnline",
          "isAvailable"
        ].join(" ")
      );
  }

  const booking = await query;

  if (!booking) {
    throw new RideServiceError(
      "Booking not found",
      404,
      "BOOKING_NOT_FOUND"
    );
  }

  return booking;
}

async function getDriverOrThrow(
  driverId
) {
  const driver = await User.findOne({
    _id: objectId(
      driverId,
      "Driver ID"
    ),

    role: "driver",
    isActive: true,
    accountStatus: "active"
  });

  if (!driver) {
    throw new RideServiceError(
      "Driver not found or inactive",
      404,
      "DRIVER_NOT_FOUND"
    );
  }

  return driver;
}

async function releaseDriver(
  driverId,
  bookingId = null
) {
  if (!driverId) {
    return null;
  }

  const filter = {
    _id: objectId(
      driverId,
      "Driver ID"
    ),

    role: "driver"
  };

  if (bookingId) {
    filter.currentRide = objectId(
      bookingId,
      "Booking ID"
    );
  }

  return User.findOneAndUpdate(
    filter,

    {
      $set: {
        isAvailable: true,
        currentRide: null,
        lastSeenAt: new Date()
      }
    },

    {
      new: true
    }
  );
}

async function markDriverBusy(
  driverId,
  bookingId
) {
  return User.findOneAndUpdate(
    {
      _id: objectId(
        driverId,
        "Driver ID"
      ),

      role: "driver",
      isActive: true,
      accountStatus: "active",
      isOnline: true,
      isAvailable: true,
      currentRide: null,
      "driverProfile.isApproved": true
    },

    {
      $set: {
        isAvailable: false,

        currentRide: objectId(
          bookingId,
          "Booking ID"
        ),

        lastSeenAt: new Date()
      }
    },

    {
      new: true
    }
  );
}

/*
|--------------------------------------------------------------------------
| Create Ride
|--------------------------------------------------------------------------
*/

async function createRide({
  customerId,
  pickup,
  dropoff,
  pickupCoordinates = null,
  dropCoordinates = null,
  travelDate = null,
  passengers = 1,
  vehicleType = "hatchback",
  distanceKm = null,
  distance = null,
  estimatedDurationMinutes = 0,
  routePolyline = "",
  fare = null,
  estimatedFare = null,
  paymentMethod = "cash",
  note = ""
}) {
  const customerObjectId = objectId(
    customerId,
    "Customer ID"
  );

  const customer =
    await User.findOne({
      _id: customerObjectId,
      role: "customer",
      isActive: true,
      accountStatus: "active"
    }).select("_id");

  if (!customer) {
    throw new RideServiceError(
      "Customer not found or inactive",
      404,
      "CUSTOMER_NOT_FOUND"
    );
  }

  const activeRide =
    await Booking.findOne({
      customer: customerObjectId,

      status: {
        $in: ACTIVE_RIDE_STATUSES
      }
    }).select(
      "_id bookingNumber status"
    );

  if (activeRide) {
    throw new RideServiceError(
      "You already have an active ride",
      409,
      "ACTIVE_RIDE_EXISTS"
    );
  }

  const normalizedPickup =
    normalizeLocation(
      pickup,
      pickupCoordinates,
      "Pickup"
    );

  const normalizedDropoff =
    normalizeLocation(
      dropoff,
      dropCoordinates,
      "Dropoff"
    );

  const date = travelDate
    ? new Date(travelDate)
    : new Date();

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new RideServiceError(
      "Travel date is invalid",
      400,
      "INVALID_TRAVEL_DATE"
    );
  }

  const passengerCount =
    numberValue(
      passengers,
      "Passengers",
      {
        required: true,
        minimum: 1,
        maximum: 20
      }
    );

  if (
    !Number.isInteger(
      passengerCount
    )
  ) {
    throw new RideServiceError(
      "Passengers must be a whole number",
      400,
      "INVALID_PASSENGERS"
    );
  }

  const allowedVehicles = [
    "hatchback",
    "sedan",
    "suv",
    "traveller",
    "bike",
    "other"
  ];

  const normalizedVehicleType =
    text(
      vehicleType,
      "hatchback"
    ).toLowerCase();

  if (
    !allowedVehicles.includes(
      normalizedVehicleType
    )
  ) {
    throw new RideServiceError(
      "Vehicle type is invalid",
      400,
      "INVALID_VEHICLE_TYPE"
    );
  }

  /*
  | Client se distance aayi ya nahi - dono handle karo
  */
  const clientDistance = numberValue(
    distanceKm ?? distance,
    "Distance",
    {
      minimum: 0,
      fallback: 0
    }
  );

  /*
  | Distance missing ya 0 hai toh coordinates se khud calculate karo
  */
  const normalizedDistance =
    clientDistance > 0
      ? clientDistance
      : haversineDistanceKm(
          normalizedPickup.coordinates
            .latitude,
          normalizedPickup.coordinates
            .longitude,
          normalizedDropoff.coordinates
            .latitude,
          normalizedDropoff.coordinates
            .longitude
        );

  if (clientDistance <= 0) {
    console.log(
      `[createRide] Distance client se nahi aayi - coordinates se calculate kiya: ${normalizedDistance} km`
    );
  }

  const duration =
    numberValue(
      estimatedDurationMinutes,
      "Estimated duration",
      {
        minimum: 0,
        fallback: 0
      }
    );

  const fareData =
    fare &&
    typeof fare === "object"
      ? fare
      : {};

  const clientFare = numberValue(
    fareData.estimatedFare ??
      estimatedFare,
    "Estimated fare",
    {
      minimum: 0,
      fallback: 0
    }
  );

  /*
  | Fare estimate na aaye toh distance se calculate karo.
  | Base fare + per-km rate (Himachal ke hisaab se).
  */
  const BASE_FARE = 50;
  const PER_KM_RATE = 18;

  const fareEstimate =
    clientFare > 0
      ? clientFare
      : Math.round(
          BASE_FARE +
            normalizedDistance *
              PER_KM_RATE
        );

  if (clientFare <= 0) {
    console.log(
      `[createRide] Fare estimate client se nahi aaya - distance se calculate kiya: Rs.${fareEstimate}`
    );
  }

  const normalizedPaymentMethod =
    text(
      paymentMethod,
      "cash"
    ).toLowerCase();

  if (
    ![
      "cash",
      "online",
      "wallet"
    ].includes(
      normalizedPaymentMethod
    )
  ) {
    throw new RideServiceError(
      "Payment method is invalid",
      400,
      "INVALID_PAYMENT_METHOD"
    );
  }

  const booking =
    await Booking.create({
      bookingNumber:
        await generateBookingNumber(),

      customer: customerObjectId,

      pickup:
        normalizedPickup,

      dropoff:
        normalizedDropoff,

      travelDate: date,

      passengers:
        passengerCount,

      vehicleType:
        normalizedVehicleType,

      distanceKm:
        normalizedDistance,

      estimatedDurationMinutes:
        duration,

      routePolyline:
        text(routePolyline),

      fare: {
        ...fareData,

        estimatedFare:
          fareEstimate,

        finalFare:
          numberValue(
            fareData.finalFare,
            "Final fare",
            {
              minimum: 0,
              fallback: 0
            }
          )
      },

      payment: {
        method:
          normalizedPaymentMethod,

        status: "pending"
      },

      status: "pending",

      note: text(note),

      expiresAt:
        addMinutes(
          new Date(),
          DEFAULT_RIDE_EXPIRY_MINUTES
        )
    });

  let dispatchResult = null;

  try {
    dispatchResult =
      await dispatchRide({
        bookingId:
          booking._id
      });
  } catch (error) {
    console.error(
      "[createRide dispatch]",
      error.message
    );
  }

  const finalBooking =
    await getBookingOrThrow(
      booking._id,
      {
        populate: true
      }
    );

  return {
    booking: finalBooking,
    dispatch:
      dispatchResult
  };
}

/*
|--------------------------------------------------------------------------
| Ride History
|--------------------------------------------------------------------------
*/

async function getMyRides({
  userId,
  role,
  page = 1,
  limit = 20,
  status = null
}) {
  const userObjectId =
    objectId(
      userId,
      "User ID"
    );

  const pageNumber =
    Math.max(
      Number(page) || 1,
      1
    );

  const limitNumber =
    Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

  const filter = {};

  if (role === "customer") {
    filter.customer =
      userObjectId;
  } else if (role === "driver") {
    filter.driver =
      userObjectId;
  } else if (role !== "admin") {
    throw new RideServiceError(
      "Invalid user role",
      403,
      "INVALID_ROLE"
    );
  }

  if (status) {
    filter.status = status;
  }

  const customerPopulateFields =
    role === "admin"
      ? "name phone alternativePhone email profileImage accountStatus isActive lastLoginAt lastSeenAt createdAt updatedAt"
      : "name phone profileImage";

  const driverPopulateFields =
    role === "admin"
      ? "name phone alternativePhone email profileImage driverProfile currentLocation isOnline isAvailable accountStatus isActive lastLoginAt lastSeenAt createdAt updatedAt"
      : "name phone profileImage driverProfile currentLocation";

  const [
    bookings,
    total
  ] = await Promise.all([
    Booking.find(filter)
      .sort({
        createdAt: -1
      })
      .skip(
        (pageNumber - 1) *
          limitNumber
      )
      .limit(limitNumber)
      .populate(
        "customer",
        customerPopulateFields
      )
      .populate(
        "driver",
        driverPopulateFields
      ),

    Booking.countDocuments(
      filter
    )
  ]);

  return {
    bookings,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,

      totalPages:
        Math.ceil(
          total /
            limitNumber
        )
    }
  };
}

/*
|--------------------------------------------------------------------------
| Get Ride By ID
|--------------------------------------------------------------------------
*/

async function getRideById({
  bookingId,
  userId,
  role
}) {
  const booking =
    await getBookingOrThrow(
      bookingId,
      {
        populate: true
      }
    );

  const currentUserId =
    objectId(
      userId,
      "User ID"
    ).toString();

  if (
    role === "customer" &&
    booking.customer?._id
      ?.toString() !==
      currentUserId
  ) {
    throw new RideServiceError(
      "You cannot access this ride",
      403,
      "RIDE_ACCESS_DENIED"
    );
  }

  if (
    role === "driver" &&
    booking.driver?._id
      ?.toString() !==
      currentUserId
  ) {
    throw new RideServiceError(
      "You cannot access this ride",
      403,
      "RIDE_ACCESS_DENIED"
    );
  }

  if (
    ![
      "customer",
      "driver",
      "admin"
    ].includes(role)
  ) {
    throw new RideServiceError(
      "Ride access denied",
      403,
      "RIDE_ACCESS_DENIED"
    );
  }

  return booking;
}

/*
|--------------------------------------------------------------------------
| Active Ride
|--------------------------------------------------------------------------
*/

async function getCustomerActiveRide(
  customerId
) {
  return Booking.findOne({
    customer: objectId(
      customerId,
      "Customer ID"
    ),

    status: {
      $in: ACTIVE_RIDE_STATUSES
    }
  })
    .sort({
      createdAt: -1
    })
    .populate(
      "customer",
      "name phone profileImage"
    )
    .populate(
      "driver",
      "name phone profileImage driverProfile currentLocation"
    );
}

async function getDriverActiveRide(
  driverId
) {
  return Booking.findOne({
    driver: objectId(
      driverId,
      "Driver ID"
    ),

    status: {
      $in: ACTIVE_RIDE_STATUSES
    }
  })
    .sort({
      createdAt: -1
    })
    .populate(
      "customer",
      "name phone profileImage"
    )
    .populate(
      "driver",
      "name phone profileImage driverProfile currentLocation"
    );
}

/*
|--------------------------------------------------------------------------
| Find Nearest Drivers
|--------------------------------------------------------------------------
*/

async function findNearestDrivers({
  bookingId,
  radiusMeters =
    DEFAULT_DRIVER_SEARCH_RADIUS_METERS,
  limit =
    DEFAULT_DRIVER_LIMIT
}) {
  const booking =
    await getBookingOrThrow(
      bookingId
    );

  const geo =
    pickupGeo(booking);

  const radius =
    Math.max(
      Number(radiusMeters) ||
        DEFAULT_DRIVER_SEARCH_RADIUS_METERS,
      100
    );

  const driverLimit =
    Math.min(
      Math.max(
        Number(limit) ||
          DEFAULT_DRIVER_LIMIT,
        1
      ),
      50
    );

  const rejectedIds =
    booking.rejectedDrivers ||
    [];

  const drivers =
    await User.aggregate([
      {
        $geoNear: {
          near: geo,
          distanceField:
            "distanceMeters",

          spherical: true,

          maxDistance:
            radius,

          key:
            "currentLocation.geo",

          query: {
            role: "driver",
            isActive: true,
            accountStatus:
              "active",
            isOnline: true,
            isAvailable: true,
            currentRide: null,

            "driverProfile.isApproved":
              true,

            _id: {
              $nin:
                rejectedIds
            }
          }
        }
      },

      {
        $limit:
          driverLimit
      },

      {
        $project: {
          name: 1,
          phone: 1,
          profileImage: 1,
          driverProfile: 1,
          currentLocation: 1,

          distanceMeters: 1,

          distanceKm: {
            $divide: [
              "$distanceMeters",
              1000
            ]
          }
        }
      }
    ]);

  return drivers.map(
    (driver) => ({
      ...driver,

      etaMinutes:
        Math.max(
          Math.ceil(
            driver.distanceKm *
              3
          ),
          1
        )
    })
  );
}


/*
|--------------------------------------------------------------------------
| Find Nearby Busy Drivers For Preview-Only Notifications
|--------------------------------------------------------------------------
| Active ride ke time driver ko next nearby ride ki notification/list preview
| mil sakti hai, lekin ye drivers dispatchQueue me add nahi hote aur Accept /
| Reject authority nahi paate. Actual acceptance server-side availability gate
| se hi possible rahegi.
|--------------------------------------------------------------------------
*/

async function findNearbyBusyDriversForPreview({
  bookingId,
  radiusMeters =
    DEFAULT_DRIVER_SEARCH_RADIUS_METERS,
  limit =
    DEFAULT_DRIVER_LIMIT
}) {
  const booking =
    await getBookingOrThrow(
      bookingId
    );

  const geo =
    pickupGeo(booking);

  const radius =
    Math.max(
      Number(radiusMeters) ||
        DEFAULT_DRIVER_SEARCH_RADIUS_METERS,
      100
    );

  const driverLimit =
    Math.min(
      Math.max(
        Number(limit) ||
          DEFAULT_DRIVER_LIMIT,
        1
      ),
      50
    );

  const rejectedIds =
    booking.rejectedDrivers ||
    [];

  const drivers =
    await User.aggregate([
      {
        $geoNear: {
          near: geo,
          distanceField:
            "distanceMeters",
          spherical: true,
          maxDistance:
            radius,
          key:
            "currentLocation.geo",
          query: {
            role: "driver",
            isActive: true,
            accountStatus:
              "active",
            isOnline: true,
            "driverProfile.isApproved":
              true,
            _id: {
              $nin:
                rejectedIds
            },
            currentRide: {
              $ne: null
            }
          }
        }
      },
      {
        $limit:
          driverLimit
      },
      {
        $project: {
          name: 1,
          phone: 1,
          profileImage: 1,
          driverProfile: 1,
          currentLocation: 1,
          currentRide: 1,
          isAvailable: 1,
          distanceMeters: 1,
          distanceKm: {
            $divide: [
              "$distanceMeters",
              1000
            ]
          }
        }
      }
    ]);

  return drivers.map(
    (driver) => ({
      ...driver,
      previewOnly: true,
      actionsLocked: true,
      lockReason:
        "Current ride active. Ride complete hone ke baad action available hoga.",
      etaMinutes:
        Math.max(
          Math.ceil(
            Number(
              driver.distanceKm ||
                0
            ) * 3
          ),
          1
        )
    })
  );
}

/*
|--------------------------------------------------------------------------
| Dispatch Ride
|--------------------------------------------------------------------------
*/

async function dispatchRide({
  bookingId,
  radiusMeters =
    DEFAULT_DRIVER_SEARCH_RADIUS_METERS,
  limit =
    DEFAULT_DRIVER_LIMIT,
  timeoutSeconds =
    DEFAULT_DISPATCH_TIMEOUT_SECONDS
}) {
  const booking =
    await getBookingOrThrow(
      bookingId
    );

  if (
    ![
      "pending",
      "searching_driver"
    ].includes(
      booking.status
    )
  ) {
    throw new RideServiceError(
      "Ride cannot be dispatched in its current status",
      409,
      "DISPATCH_NOT_ALLOWED"
    );
  }

  const drivers =
    await findNearestDrivers({
      bookingId:
        booking._id,

      radiusMeters,
      limit
    });

  const previewDrivers =
    await findNearbyBusyDriversForPreview({
      bookingId:
        booking._id,
      radiusMeters,
      limit
    }).catch(
      () => []
    );

  const emitPreviewRequests = () => {
    for (const driver of previewDrivers) {
      safeEmit(
        emitRideRequest,
        {
          booking,
          driverId:
            driver._id,
          driver,
          data: {
            previewOnly: true,
            actionsLocked: true,
            lockReason:
              "Current ride active. Ride complete hone ke baad Accept / Reject available hoga.",
            distanceKm:
              driver.distanceKm ||
              0,
            etaMinutes:
              driver.etaMinutes ||
              0
          }
        }
      );
    }
  };

  if (!drivers.length) {
    booking.status =
      "searching_driver";

    await booking.save();

    safeEmit(
      emitRideStatusUpdated,
      {
        booking,
        status:
          booking.status
      }
    );

    emitPreviewRequests();

    return {
      booking,
      drivers: [],
      previewDrivers,
      previewCount:
        previewDrivers.length,
      count: 0,

      message:
        "No available drivers found"
    };
  }

  const now =
    new Date();

  const expiresAt =
    addSeconds(
      now,
      Math.max(
        Number(timeoutSeconds) ||
          DEFAULT_DISPATCH_TIMEOUT_SECONDS,
        5
      )
    );

  booking.status =
    "searching_driver";

  booking.dispatchQueue =
    drivers.map(
      (driver) => ({
        driver:
          driver._id,

        notifiedAt:
          now,

        expiresAt,

        status:
          "pending",

        distanceKm:
          driver.distanceKm ||
          0,

        etaMinutes:
          driver.etaMinutes ||
          0
      })
    );

  await booking.save();

  for (
    const driver of drivers
  ) {
    safeEmit(
      emitRideRequest,
      {
        booking,
        driverId:
          driver._id,

        driver
      }
    );

    /*
    |--------------------------------------------------------------------
    | Native Driver Ride Notification
    |--------------------------------------------------------------------
    | Socket foreground speed ke liye hai; Expo push background/killed app
    | ke liye. Category app me Accept / Reject action buttons register karti
    | hai. Push failure dispatch ko kabhi fail nahi karta.
    |--------------------------------------------------------------------
    */

    const pickupName =
      booking?.pickup?.address ||
      booking?.pickup?.name ||
      "Pickup";

    const dropName =
      booking?.dropoff?.address ||
      booking?.dropoff?.name ||
      "Drop";

    sendPushToUser(
      driver._id,
      {
        title: "🚕 New HimRideG Ride",
        body: `${pickupName} → ${dropName}`,
        categoryId: "HIMRIDEG_RIDE_REQUEST",
        data: {
          type: "ride_request",
          bookingId: String(booking._id),
          pickup: pickupName,
          drop: dropName
        }
      }
    ).catch((error) => {
      console.error(
        "[RideService push error]",
        error.message
      );
    });
  }

  emitPreviewRequests();

  safeEmit(
    emitRideStatusUpdated,
    {
      booking,
      status:
        booking.status
    }
  );

  return {
    booking,
    drivers,
    previewDrivers,
    previewCount:
      previewDrivers.length,
    count:
      drivers.length,

    expiresAt,

    message:
      "Ride dispatched successfully"
  };
}

/*
|--------------------------------------------------------------------------
| Driver Accept
|--------------------------------------------------------------------------
*/

async function acceptRide({
  bookingId,
  driverId
}) {
  const bookingObjectId =
    objectId(
      bookingId,
      "Booking ID"
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  await getDriverOrThrow(
    driverObjectId
  );

  const booking =
    await Booking.findOne({
      _id: bookingObjectId,
      status: "searching_driver",

      driver: null,

      dispatchQueue: {
        $elemMatch: {
          driver:
            driverObjectId,

          status:
            "pending",

          expiresAt: {
            $gt: new Date()
          }
        }
      }
    }).select(
      "+rideStartOtp.otpHash"
    );

  if (!booking) {
    throw new RideServiceError(
      "Ride request is unavailable or expired",
      409,
      "RIDE_REQUEST_UNAVAILABLE"
    );
  }

  const busyDriver =
    await markDriverBusy(
      driverObjectId,
      bookingObjectId
    );

  if (!busyDriver) {
    throw new RideServiceError(
      "Driver is no longer available",
      409,
      "DRIVER_NOT_AVAILABLE"
    );
  }

  try {
    const otp =
      generateOtp(4);

    const otpHash =
      await bcrypt.hash(
        otp,
        10
      );

    const otpExpiresAt =
      addMinutes(
        new Date(),
        DEFAULT_OTP_EXPIRY_MINUTES
      );

    booking.driver =
      driverObjectId;

    booking.status =
      "accepted";

    booking.acceptedAt =
      new Date();

    booking.rideStartOtp = {
      otpHash,
      expiresAt:
        otpExpiresAt,
      attempts: 0,
      maxAttempts:
        MAX_OTP_ATTEMPTS,
      verified: false,
      verifiedAt: null
    };

    booking.dispatchQueue.forEach(
      (request) => {
        if (
          request.driver
            .toString() ===
          driverObjectId.toString()
        ) {
          request.status =
            "accepted";
        } else if (
          request.status ===
          "pending"
        ) {
          request.status =
            "ignored";
        }
      }
    );

    await booking.save();

    const populated =
      await getBookingOrThrow(
        booking._id,
        {
          populate: true
        }
      );

    safeEmit(
      emitRideAccepted,
      {
        booking:
          populated,

        driverId:
          driverObjectId
      }
    );

    safeEmit(
      emitRideOtpGenerated,
      {
        booking:
          populated,

        rideStartOtp:
          otp,

        otpExpiresAt
      }
    );

    safeEmit(
      emitRideStatusUpdated,
      {
        booking:
          populated,

        status:
          populated.status
      }
    );

    return {
      booking:
        populated,

      rideStartOtp:
        otp,

      otpExpiresAt
    };
  } catch (error) {
    await releaseDriver(
      driverObjectId,
      bookingObjectId
    );

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Driver Reject
|--------------------------------------------------------------------------
*/

async function rejectRide({
  bookingId,
  driverId
}) {
  const booking =
    await getBookingOrThrow(
      bookingId
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  if (
    booking.status !==
    "searching_driver"
  ) {
    throw new RideServiceError(
      "Ride request cannot be rejected now",
      409,
      "REJECTION_NOT_ALLOWED"
    );
  }

  const request =
    booking.dispatchQueue.find(
      (item) =>
        item.driver
          .toString() ===
        driverObjectId.toString()
    );

  if (!request) {
    throw new RideServiceError(
      "Ride request was not sent to this driver",
      404,
      "DRIVER_REQUEST_NOT_FOUND"
    );
  }

  request.status =
    "rejected";

  booking.addRejectedDriver(
    driverObjectId
  );

  await booking.save();

  safeEmit(
    emitRideRejected,
    {
      booking,
      driverId:
        driverObjectId
    }
  );

  return {
    booking,
    driverId:
      driverObjectId
  };
}

/*
|--------------------------------------------------------------------------
| Expire Driver Requests
|--------------------------------------------------------------------------
*/

async function expireDriverRequests(
  bookingId
) {
  const booking =
    await getBookingOrThrow(
      bookingId
    );

  if (
    booking.status !==
    "searching_driver"
  ) {
    return null;
  }

  const now =
    new Date();

  let changed =
    false;

  booking.dispatchQueue.forEach(
    (request) => {
      if (
        request.status ===
          "pending" &&
        request.expiresAt &&
        request.expiresAt <=
          now
      ) {
        request.status =
          "expired";

        changed = true;
      }
    }
  );

  if (!changed) {
    return {
      booking,
      expiredCount: 0
    };
  }

  await booking.save();

  const expiredCount =
    booking.dispatchQueue.filter(
      (request) =>
        request.status ===
        "expired"
    ).length;

  return {
    booking,
    expiredCount
  };
}

/*
|--------------------------------------------------------------------------
| Driver Arriving
|--------------------------------------------------------------------------
*/

async function markDriverArriving({
  bookingId,
  driverId
}) {
  const bookingObjectId =
    objectId(
      bookingId,
      "Booking ID"
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  const booking =
    await Booking.findOne({
      _id: bookingObjectId,
      driver: driverObjectId,

      status: {
        $in: [
          "driver_assigned",
          "accepted",
          "fare_offered",
          "negotiating",
          "fare_accepted"
        ]
      }
    });

  if (!booking) {
    throw new RideServiceError(
      "Driver cannot mark arriving for this ride",
      409,
      "ARRIVING_NOT_ALLOWED"
    );
  }

  const finalFare = Number(
    booking.fare?.finalFare ||
      booking.finalFare ||
      booking.negotiatedFare ||
      booking.driverOfferedFare ||
      0
  );

  if (
    !Number.isFinite(finalFare) ||
    finalFare <= 0
  ) {
    throw new RideServiceError(
      "Final fare accept hone ke baad hi pickup ke liye ja sakte ho",
      409,
      "FINAL_FARE_NOT_ACCEPTED"
    );
  }

  booking.status =
    "driver_arriving";

  booking.driverArrivingAt =
    new Date();

  await booking.save();

  const populatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
      .populate(
        "driver",
        "name phone profileImage driverProfile currentLocation"
      );

  safeEmit(
    emitDriverArriving,
    {
      booking:
        populatedBooking
    }
  );

  safeEmit(
    emitRideStatusUpdated,
    {
      booking:
        populatedBooking,

      status:
        populatedBooking.status
    }
  );

  return populatedBooking;
}

/*
|--------------------------------------------------------------------------
| Driver Arrived
|--------------------------------------------------------------------------
*/

async function markDriverArrived({
  bookingId,
  driverId
}) {
  const booking =
    await Booking.findOneAndUpdate(
      {
        _id: objectId(
          bookingId,
          "Booking ID"
        ),

        driver: objectId(
          driverId,
          "Driver ID"
        ),

        status: {
          $in: [
            "accepted",
            "driver_arriving"
          ]
        }
      },

      {
        $set: {
          status:
            "driver_arrived",

          driverArrivedAt:
            new Date()
        }
      },

      {
        new: true,
        runValidators: true
      }
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
      .populate(
        "driver",
        "name phone profileImage driverProfile currentLocation"
      );

  if (!booking) {
    throw new RideServiceError(
      "Driver cannot mark arrived for this ride",
      409,
      "ARRIVED_NOT_ALLOWED"
    );
  }

  safeEmit(
    emitDriverArrived,
    {
      booking
    }
  );

  safeEmit(
    emitRideStatusUpdated,
    {
      booking,
      status:
        booking.status
    }
  );

  return booking;
}

/*
|--------------------------------------------------------------------------
| Verify Start OTP
|--------------------------------------------------------------------------
*/

async function verifyRideStartOtp({
  bookingId,
  driverId,
  otp
}) {
  const booking =
    await getBookingOrThrow(
      bookingId,
      {
        includeOtpHash:
          true
      }
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  if (
    !booking.driver ||
    booking.driver.toString() !==
      driverObjectId.toString()
  ) {
    throw new RideServiceError(
      "You are not assigned to this ride",
      403,
      "DRIVER_NOT_ASSIGNED"
    );
  }

  if (
    booking.status !==
    "driver_arrived"
  ) {
    throw new RideServiceError(
      "OTP can only be verified after driver arrival",
      409,
      "OTP_VERIFICATION_NOT_ALLOWED"
    );
  }

  if (
    booking.rideStartOtp
      ?.verified
  ) {
    return booking;
  }

  if (
    !booking.rideStartOtp
      ?.otpHash
  ) {
    throw new RideServiceError(
      "Ride OTP has not been generated",
      409,
      "OTP_NOT_GENERATED"
    );
  }

  if (
    !booking.rideStartOtp
      .expiresAt ||
    booking.rideStartOtp
      .expiresAt <
      new Date()
  ) {
    throw new RideServiceError(
      "Ride OTP has expired",
      410,
      "OTP_EXPIRED"
    );
  }

  if (
    booking.rideStartOtp
      .attempts >=
    booking.rideStartOtp
      .maxAttempts
  ) {
    throw new RideServiceError(
      "Maximum OTP attempts exceeded",
      429,
      "OTP_ATTEMPTS_EXCEEDED"
    );
  }

  const suppliedOtp =
    text(otp);

  if (!suppliedOtp) {
    throw new RideServiceError(
      "OTP is required",
      400,
      "OTP_REQUIRED"
    );
  }

  const matched =
    await bcrypt.compare(
      suppliedOtp,
      booking.rideStartOtp
        .otpHash
    );

  if (!matched) {
    booking.rideStartOtp
      .attempts += 1;

    await booking.save();

    throw new RideServiceError(
      "Incorrect ride OTP",
      400,
      "INVALID_RIDE_OTP"
    );
  }

  booking.rideStartOtp
    .verified = true;

  booking.rideStartOtp
    .verifiedAt =
    new Date();

  await booking.save();

  safeEmit(
    emitRideOtpVerified,
    {
      booking,
      driverId:
        driverObjectId
    }
  );

  return booking;
}

/*
|--------------------------------------------------------------------------
| Regenerate Start OTP
|--------------------------------------------------------------------------
*/

async function regenerateRideStartOtp({
  bookingId,
  userId,
  role
}) {
  const booking =
    await getBookingOrThrow(
      bookingId,
      {
        includeOtpHash:
          true
      }
    );

  const currentUserId =
    objectId(
      userId,
      "User ID"
    );

  if (
    ![
      "customer",
      "driver",
      "admin"
    ].includes(role)
  ) {
    throw new RideServiceError(
      "OTP regeneration access denied",
      403,
      "OTP_ACCESS_DENIED"
    );
  }

  if (
    role === "customer" &&
    booking.customer
      .toString() !==
      currentUserId.toString()
  ) {
    throw new RideServiceError(
      "OTP regeneration access denied",
      403,
      "OTP_ACCESS_DENIED"
    );
  }

  if (
    role === "driver" &&
    (
      !booking.driver ||
      booking.driver
        .toString() !==
        currentUserId.toString()
    )
  ) {
    throw new RideServiceError(
      "OTP regeneration access denied",
      403,
      "OTP_ACCESS_DENIED"
    );
  }

  if (
    ![
      "accepted",
      "fare_offered",
      "negotiating",
      "fare_accepted",
      "driver_arriving",
      "driver_arrived"
    ].includes(
      booking.status
    )
  ) {
    throw new RideServiceError(
      "OTP cannot be regenerated at this stage",
      409,
      "OTP_REGENERATION_NOT_ALLOWED"
    );
  }

  const otp =
    generateOtp(4);

  const otpHash =
    await bcrypt.hash(
      otp,
      10
    );

  const otpExpiresAt =
    addMinutes(
      new Date(),
      DEFAULT_OTP_EXPIRY_MINUTES
    );

  booking.rideStartOtp = {
    otpHash,
    expiresAt:
      otpExpiresAt,
    attempts: 0,
    maxAttempts:
      MAX_OTP_ATTEMPTS,
    verified: false,
    verifiedAt: null
  };

  await booking.save();

  safeEmit(
    emitRideOtpGenerated,
    {
      booking,
      rideStartOtp:
        otp,
      otpExpiresAt
    }
  );

  return {
    booking,
    rideStartOtp:
      otp,
    otpExpiresAt
  };
}

/*
|--------------------------------------------------------------------------
| Start Ride
|--------------------------------------------------------------------------
*/

async function startRide({
  bookingId,
  driverId
}) {
  const booking =
    await Booking.findOne({
      _id: objectId(
        bookingId,
        "Booking ID"
      ),

      driver: objectId(
        driverId,
        "Driver ID"
      ),

      status:
        "driver_arrived"
    }).select(
      "+rideStartOtp.otpHash"
    );

  if (!booking) {
    throw new RideServiceError(
      "Ride cannot be started",
      409,
      "RIDE_START_NOT_ALLOWED"
    );
  }

  if (
    !booking.rideStartOtp
      ?.verified
  ) {
    throw new RideServiceError(
      "Verify customer OTP before starting ride",
      409,
      "OTP_NOT_VERIFIED"
    );
  }

  booking.status =
    "started";

  booking.startedAt =
    new Date();

  await booking.save();

  const populated =
    await getBookingOrThrow(
      booking._id,
      {
        populate: true
      }
    );

  safeEmit(
    emitRideStarted,
    {
      booking:
        populated
    }
  );

  safeEmit(
    emitRideStatusUpdated,
    {
      booking:
        populated,

      status:
        populated.status
    }
  );

  return populated;
}

/*
|--------------------------------------------------------------------------
| Update Driver Location
|--------------------------------------------------------------------------
*/

async function updateDriverLocation({
  bookingId,
  driverId,
  latitude,
  longitude,
  heading = null,
  speed = null,
  accuracy = null
}) {
  const bookingObjectId =
    objectId(
      bookingId,
      "Booking ID"
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  const lat =
    numberValue(
      latitude,
      "Latitude",
      {
        required: true,
        minimum: -90,
        maximum: 90
      }
    );

  const lng =
    numberValue(
      longitude,
      "Longitude",
      {
        required: true,
        minimum: -180,
        maximum: 180
      }
    );

  const now =
    new Date();

  const location = {
    latitude: lat,
    longitude: lng,

    geo: {
      type: "Point",
      coordinates: [
        lng,
        lat
      ]
    },

    heading:
      heading === null
        ? null
        : Number(heading),

    speed:
      speed === null
        ? null
        : Number(speed),

    accuracy:
      accuracy === null
        ? null
        : Number(accuracy),

    updatedAt: now
  };

  const booking =
    await Booking.findOneAndUpdate(
      {
        _id:
          bookingObjectId,

        driver:
          driverObjectId,

        status: {
          $in: [
            "accepted",
            "fare_offered",
            "negotiating",
            "fare_accepted",
            "driver_arriving",
            "driver_arrived",
            "started"
          ]
        }
      },

      {
        $set: {
          driverLocation:
            location
        }
      },

      {
        new: true,
        runValidators: true
      }
    );

  if (!booking) {
    throw new RideServiceError(
      "Driver cannot update this ride location",
      409,
      "LOCATION_UPDATE_NOT_ALLOWED"
    );
  }

  await User.updateOne(
    {
      _id:
        driverObjectId,

      role:
        "driver"
    },

    {
      $set: {
        currentLocation:
          location,

        lastSeenAt:
          now
      }
    }
  );

  safeEmit(
    emitDriverLocationUpdated,
    {
      booking,
      driverId:
        driverObjectId,
      location
    }
  );

  return booking;
}

/*
|--------------------------------------------------------------------------
| Complete Ride
|--------------------------------------------------------------------------
*/

async function completeRide({
  bookingId,
  driverId,
  actualDistanceKm = null,
  actualDurationMinutes = null,
  finalFare = null
}) {
  const bookingObjectId =
    objectId(
      bookingId,
      "Booking ID"
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  const update = {
    status:
      "completed",

    completedAt:
      new Date()
  };

  if (
    actualDistanceKm !==
      null &&
    Number.isFinite(
      Number(
        actualDistanceKm
      )
    ) &&
    Number(
      actualDistanceKm
    ) >= 0
  ) {
    update.actualDistanceKm =
      Number(
        actualDistanceKm
      );
  }

  if (
    actualDurationMinutes !==
      null &&
    Number.isFinite(
      Number(
        actualDurationMinutes
      )
    ) &&
    Number(
      actualDurationMinutes
    ) >= 0
  ) {
    update.actualDurationMinutes =
      Number(
        actualDurationMinutes
      );
  }

  if (
    finalFare !== null &&
    Number.isFinite(
      Number(finalFare)
    ) &&
    Number(finalFare) >= 0
  ) {
    update[
      "fare.finalFare"
    ] = Number(finalFare);
  }

  const booking =
    await Booking.findOneAndUpdate(
      {
        _id:
          bookingObjectId,

        driver:
          driverObjectId,

        status:
          "started"
      },

      {
        $set:
          update
      },

      {
        new: true,
        runValidators: true
      }
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
      .populate(
        "driver",
        "name phone profileImage driverProfile currentLocation"
      );

  if (!booking) {
    throw new RideServiceError(
      "Only a started ride can be completed",
      409,
      "RIDE_COMPLETION_NOT_ALLOWED"
    );
  }

  await User.findOneAndUpdate(
    {
      _id:
        driverObjectId,

      role:
        "driver",

      currentRide:
        bookingObjectId
    },

    {
      $set: {
        currentRide: null,
        isAvailable: true,
        lastSeenAt:
          new Date()
      },

      $inc: {
        "driverProfile.totalRides":
          1,

        "driverProfile.completedRides":
          1
      }
    },

    {
      new: true
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Wallet Settlement
  |--------------------------------------------------------------------------
  | Ride completion sirf ride status complete karta hai. Wallet tabhi settle
  | hoga jab online payment verify ho ya driver cash receive karke confirm kare.
  | Isse failed/unpaid payment par fake earning/duplicate balance nahi banta.
  */

  // ADD-ONLY: Advance/Scheduled Pay Now ride pe payment pehle ho sakti hai.
  // Driver earning ride complete hone se pehle credit nahi hoti; completion
  // ke waqt paid booking ko idempotent wallet settlement milta hai.
  if (booking.paymentStatus === "paid") {
    try {
      await walletService.settleRidePayment(booking._id);
    } catch (settlementError) {
      console.error("[completeRide prepaid settlement]", settlementError.message);
    }
  }

  safeEmit(
    emitRideCompleted,
    {
      booking
    }
  );

  safeEmit(
    emitRideStatusUpdated,
    {
      booking,
      status:
        booking.status
    }
  );

  return booking;
}

/*
|--------------------------------------------------------------------------
| Launch V3 — Driver Release Unconfirmed Ride
|--------------------------------------------------------------------------
|
| Driver ne request accept kar li lekin customer response nahi de raha,
| final fare lock nahi hui, ya ride confirm nahi hui. Is endpoint se poori
| customer booking cancel nahi hoti. Current driver release hota hai aur
| booking dobara nearest available drivers ko dispatch hoti hai.
|
*/
async function driverReleaseRide({
  bookingId,
  driverId,
  reason = ""
}) {
  const bookingObjectId =
    objectId(
      bookingId,
      "Booking ID"
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  const booking =
    await Booking.findOne({
      _id:
        bookingObjectId,

      driver:
        driverObjectId,

      status: {
        $in: [
          "driver_assigned",
          "accepted",
          "fare_offered",
          "negotiating"
        ]
      }
    }).select(
      "+rideStartOtp.otpHash"
    );

  if (!booking) {
    throw new RideServiceError(
      "Sirf unconfirmed accepted ride ko release kar sakte ho",
      409,
      "DRIVER_RELEASE_NOT_ALLOWED"
    );
  }

  const cleanReason =
    text(
      reason,
      "Customer not responding"
    );

  booking.driverReleaseHistory.push({
    driver:
      driverObjectId,

    reason:
      cleanReason,

    releasedAt:
      new Date()
  });

  booking.addRejectedDriver(
    driverObjectId
  );

  booking.driver =
    null;

  booking.status =
    "searching_driver";

  booking.acceptedAt =
    null;

  booking.driverArrivingAt =
    null;

  booking.driverArrivedAt =
    null;

  booking.rideStartOtp = {
    otpHash:
      null,

    expiresAt:
      null,

    attempts:
      0,

    maxAttempts:
      MAX_OTP_ATTEMPTS,

    verified:
      false,

    verifiedAt:
      null
  };

  /*
  |--------------------------------------------------------------------------
  | Active fare proposal reset
  |--------------------------------------------------------------------------
  |
  | History fields object me rahe sakte hain, lekin next driver ke saath
  | current negotiation zero se start hogi.
  |
  */

  booking.driverOfferedFare =
    null;

  booking.customerCounterFare =
    null;

  booking.driverFinalFareProposal =
    null;

  booking.finalFare =
    null;

  booking.fareStatus =
    "not_offered";

  booking.fareOfferedBy =
    null;

  booking.fareOfferCount =
    0;

  booking.fareOfferedAt =
    null;

  booking.fareAcceptedAt =
    null;

  if (booking.fare) {
    booking.fare.finalFare =
      0;

    booking.fare.platformFee =
      0;
  }

  booking.platformCommissionAmount =
    0;

  booking.driverPayableAmount =
    0;

  booking.dispatchQueue.forEach(
    (request) => {
      if (
        String(
          request.driver
        ) ===
        String(
          driverObjectId
        )
      ) {
        request.status =
          "rejected";
      }
    }
  );

  booking.expiresAt =
    addMinutes(
      new Date(),
      DEFAULT_RIDE_EXPIRY_MINUTES
    );

  await booking.save();

  await releaseDriver(
    driverObjectId,
    bookingObjectId
  );

  await User.updateOne(
    {
      _id:
        driverObjectId,

      role:
        "driver"
    },

    {
      $inc: {
        "driverProfile.cancelledRides":
          1
      }
    }
  );

  socketEvents.emitBookingEvent({
    booking,

    eventName:
      "ride:driver-released",

    message:
      "Driver ne unconfirmed ride release ki. Naya driver search ho raha hai.",

    status:
      booking.status,

    metadata: {
      previousDriverId:
        driverObjectId,

      reason:
        cleanReason
    },

    sendToDriver:
      true,

    sendToCustomer:
      true,

    sendToAdmins:
      true
  });

  safeEmit(
    emitRideStatusUpdated,
    {
      booking,

      status:
        booking.status
    }
  );

  let dispatchResult =
    null;

  try {
    dispatchResult =
      await dispatchRide({
        bookingId:
          booking._id
      });
  } catch (dispatchError) {
    console.error(
      "[driverReleaseRide re-dispatch]",
      dispatchError.message
    );
  }

  const populated =
    await getBookingOrThrow(
      booking._id,
      {
        populate: true
      }
    );

  return {
    booking:
      populated,

    dispatch:
      dispatchResult
  };
}


/*
|--------------------------------------------------------------------------
| Cancel Ride
|--------------------------------------------------------------------------
*/

async function cancelRide({
  bookingId,
  userId,
  role,
  reason = "",
  cancellationCharge = 0
}) {
  const booking =
    await getBookingOrThrow(
      bookingId
    );

  const currentUserId =
    objectId(
      userId,
      "User ID"
    );

  if (
    [
      "completed",
      "cancelled",
      "expired"
    ].includes(
      booking.status
    )
  ) {
    throw new RideServiceError(
      "This ride cannot be cancelled",
      409,
      "CANCELLATION_NOT_ALLOWED"
    );
  }

  let cancelledBy;

  if (role === "customer") {
    if (
      booking.customer
        .toString() !==
      currentUserId.toString()
    ) {
      throw new RideServiceError(
        "You cannot cancel this ride",
        403,
        "CANCELLATION_ACCESS_DENIED"
      );
    }

    if (
      !CUSTOMER_CANCELLABLE_STATUSES
        .includes(
          booking.status
        )
    ) {
      throw new RideServiceError(
        "Customer cannot cancel ride at this stage",
        409,
        "CUSTOMER_CANCELLATION_NOT_ALLOWED"
      );
    }

    cancelledBy =
      "customer";
  } else if (
    role === "driver"
  ) {
    if (
      !booking.driver ||
      booking.driver
        .toString() !==
        currentUserId.toString()
    ) {
      throw new RideServiceError(
        "You are not assigned to this ride",
        403,
        "DRIVER_NOT_ASSIGNED"
      );
    }

    if (
      !DRIVER_CANCELLABLE_STATUSES
        .includes(
          booking.status
        )
    ) {
      throw new RideServiceError(
        "Driver cannot cancel ride at this stage",
        409,
        "DRIVER_CANCELLATION_NOT_ALLOWED"
      );
    }

    cancelledBy =
      "driver";
  } else if (
    role === "admin"
  ) {
    cancelledBy =
      "admin";
  } else {
    throw new RideServiceError(
      "Invalid cancellation role",
      403,
      "INVALID_ROLE"
    );
  }

  const assignedDriver =
    booking.driver;

  booking.status =
    "cancelled";

  booking.cancellation = {
    cancelledBy,

    reason:
      text(reason),

    charge:
      Math.max(
        Number(
          cancellationCharge
        ) || 0,
        0
      ),

    cancelledAt:
      new Date()
  };

  await booking.save();

  if (assignedDriver) {
    await releaseDriver(
      assignedDriver,
      booking._id
    );

    if (
      cancelledBy ===
      "driver"
    ) {
      await User.updateOne(
        {
          _id:
            assignedDriver,

          role:
            "driver"
        },

        {
          $inc: {
            "driverProfile.cancelledRides":
              1
          }
        }
      );
    }
  }

  safeEmit(
    emitRideCancelled,
    {
      booking,
      cancelledBy,
      reason:
        booking.cancellation
          .reason
    }
  );

  safeEmit(
    emitRideStatusUpdated,
    {
      booking,
      status:
        booking.status
    }
  );

  return booking;
}

/*
|--------------------------------------------------------------------------
| Expire Booking
|--------------------------------------------------------------------------
*/

async function expireBooking(
  bookingId
) {
  const booking =
    await Booking.findOneAndUpdate(
      {
        _id: objectId(
          bookingId,
          "Booking ID"
        ),

        driver: null,

        status: {
          $in: [
            "pending",
            "searching_driver"
          ]
        },

        expiresAt: {
          $lte:
            new Date()
        }
      },

      {
        $set: {
          status:
            "expired"
        }
      },

      {
        new: true
      }
    );

  if (booking) {
    safeEmit(
      emitRideRequestCancelled,
      {
        booking,
        reason:
          "Ride request expired"
      }
    );

    safeEmit(
      emitRideStatusUpdated,
      {
        booking,
        status:
          "expired"
      }
    );
  }

  return booking;
}

/*
|--------------------------------------------------------------------------
| Rate Driver
|--------------------------------------------------------------------------
*/

async function rateDriver({
  bookingId,
  customerId,
  rating,
  review = ""
}) {
  const ratingValue =
    Number(rating);

  if (
    !Number.isInteger(
      ratingValue
    ) ||
    ratingValue < 1 ||
    ratingValue > 5
  ) {
    throw new RideServiceError(
      "Rating must be between 1 and 5",
      400,
      "INVALID_RATING"
    );
  }

  const booking =
    await Booking.findOneAndUpdate(
      {
        _id: objectId(
          bookingId,
          "Booking ID"
        ),

        customer: objectId(
          customerId,
          "Customer ID"
        ),

        status:
          "completed",

        "rating.customerRating":
          null
      },

      {
        $set: {
          "rating.customerRating":
            ratingValue,

          "rating.customerReview":
            text(review)
        }
      },

      {
        new: true,
        runValidators: true
      }
    );

  if (!booking) {
    throw new RideServiceError(
      "Ride is not completed or already rated",
      409,
      "RATING_NOT_ALLOWED"
    );
  }

  if (booking.driver) {
    const driver =
      await User.findById(
        booking.driver
      );

    if (driver) {
      if (
        !driver.driverProfile
      ) {
        driver.driverProfile =
          {};
      }

      const oldRating =
        Number(
          driver.driverProfile
            .rating
        ) || 0;

      const oldCount =
        Number(
          driver.driverProfile
            .ratingCount
        ) || 0;

      const newCount =
        oldCount + 1;

      const newRating =
        (
          oldRating *
            oldCount +
          ratingValue
        ) / newCount;

      driver.driverProfile
        .rating =
        Number(
          newRating.toFixed(
            2
          )
        );

      driver.driverProfile
        .ratingCount =
        newCount;

      await driver.save();
    }
  }

  return booking;
}

/*
|--------------------------------------------------------------------------
| Rate Customer
|--------------------------------------------------------------------------
*/

async function rateCustomer({
  bookingId,
  driverId,
  rating,
  review = ""
}) {
  const ratingValue =
    Number(rating);

  if (
    !Number.isInteger(
      ratingValue
    ) ||
    ratingValue < 1 ||
    ratingValue > 5
  ) {
    throw new RideServiceError(
      "Rating must be between 1 and 5",
      400,
      "INVALID_RATING"
    );
  }

  const booking =
    await Booking.findOneAndUpdate(
      {
        _id: objectId(
          bookingId,
          "Booking ID"
        ),

        driver: objectId(
          driverId,
          "Driver ID"
        ),

        status:
          "completed",

        "rating.driverRating":
          null
      },

      {
        $set: {
          "rating.driverRating":
            ratingValue,

          "rating.driverReview":
            text(review)
        }
      },

      {
        new: true,
        runValidators: true
      }
    );

  if (!booking) {
    throw new RideServiceError(
      "Ride is not completed or already rated",
      409,
      "RATING_NOT_ALLOWED"
    );
  }

  return booking;
}

async function acceptRideAtomic({
  bookingId,
  driverId
}) {
  const bookingObjectId =
    objectId(
      bookingId,
      "Booking ID"
    );

  const driverObjectId =
    objectId(
      driverId,
      "Driver ID"
    );

  await getDriverOrThrow(
    driverObjectId
  );

  const busyDriver =
    await markDriverBusy(
      driverObjectId,
      bookingObjectId
    );

  if (!busyDriver) {
    throw new RideServiceError(
      "Driver is no longer available",
      409,
      "DRIVER_NOT_AVAILABLE"
    );
  }

  try {
    const otp =
      generateOtp(4);

    const otpHash =
      await bcrypt.hash(
        otp,
        10
      );

    const now =
      new Date();

    const otpExpiresAt =
      addMinutes(
        now,
        DEFAULT_OTP_EXPIRY_MINUTES
      );

    const booking =
      await Booking.findOneAndUpdate(
        {
          _id:
            bookingObjectId,

          driver:
            null,

          status: {
            $in: [
              "pending",
              "searching_driver"
            ]
          },

          rejectedDrivers: {
            $ne:
              driverObjectId
          },

          $or: [
            {
              dispatchQueue: {
                $elemMatch: {
                  driver:
                    driverObjectId,

                  status:
                    "pending",

                  expiresAt: {
                    $gt:
                      now
                  }
                }
              }
            },

            {
              dispatchQueue: {
                $size: 0
              }
            }
          ]
        },

        {
          $set: {
            driver:
              driverObjectId,

            status:
              "accepted",

            acceptedAt:
              now,

            fareStatus:
              "not_offered",

            fareOfferedBy:
              null,

            driverOfferedFare:
              null,

            customerCounterFare:
              null,

            driverFinalFareProposal:
              null,

            finalFare:
              null,

            fareOfferCount:
              0,

            fareAcceptedAt:
              null,

            rideStartOtp: {
              otpHash,

              expiresAt:
                otpExpiresAt,

              attempts: 0,

              maxAttempts:
                MAX_OTP_ATTEMPTS,

              verified:
                false,

              verifiedAt:
                null
            }
          }
        },

        {
          new: true,
          runValidators: true
        }
      ).select(
        "+rideStartOtp.otpHash"
      );

    if (!booking) {
      await releaseDriver(
        driverObjectId,
        bookingObjectId
      );

      throw new RideServiceError(
        "Ride request ab kisi aur driver ne accept kar li ya expire ho gayi",
        409,
        "RIDE_REQUEST_UNAVAILABLE"
      );
    }

    booking.dispatchQueue.forEach(
      (request) => {
        if (
          String(
            request.driver
          ) ===
          String(
            driverObjectId
          )
        ) {
          request.status =
            "accepted";
        } else if (
          request.status ===
          "pending"
        ) {
          request.status =
            "ignored";
        }
      }
    );

    await booking.save();

    const populated =
      await getBookingOrThrow(
        booking._id,
        {
          populate: true
        }
      );

    safeEmit(
      emitRideAccepted,
      {
        booking:
          populated,

        driverId:
          driverObjectId
      }
    );

    safeEmit(
      emitRideOtpGenerated,
      {
        booking:
          populated,

        rideStartOtp:
          otp,

        otpExpiresAt
      }
    );

    safeEmit(
      emitRideStatusUpdated,
      {
        booking:
          populated,

        status:
          populated.status
      }
    );

    return {
      booking:
        populated,

      rideStartOtp:
        otp,

      otpExpiresAt
    };
  } catch (error) {
    await releaseDriver(
      driverObjectId,
      bookingObjectId
    );

    throw error;
  }
}

async function driverCanAcceptNewRide(
  driverId
) {
  const driver =
    await User.findOne({
      _id:
        objectId(
          driverId,
          "Driver ID"
        ),

      role:
        "driver"
    }).select(
      "wallet.commissionDue wallet.cashCommissionDue wallet.balance isOnline isAvailable currentRide"
    );

  if (!driver) {
    return {
      allowed:
        false,

      reason:
        "Driver not found"
    };
  }

  const commissionDue =
    Math.max(
      Number(
        driver.wallet
          ?.commissionDue ||
          0
      ),
      Number(
        driver.wallet
          ?.cashCommissionDue ||
          0
      )
    );

  if (
    COMMISSION_DUE_BLOCKS_NEW_RIDES &&
    commissionDue > 0
  ) {
    return {
      allowed:
        false,

      reason:
        `₹${commissionDue} platform commission due hai`,

      commissionDue
    };
  }

  return {
    allowed:
      Boolean(
        driver.isOnline &&
          driver.isAvailable &&
          !driver.currentRide
      ),

    commissionDue
  };
}

module.exports = {
  RideServiceError,

  createRide,
  getMyRides,
  getRideById,

  getCustomerActiveRide,
  getDriverActiveRide,

  findNearestDrivers,
  findNearbyBusyDriversForPreview,
  dispatchRide,
  acceptRide,
  acceptRideAtomic,
  rejectRide,
  driverReleaseRide,
  driverCanAcceptNewRide,

  expireDriverRequests,
  expireBooking,

  markDriverArriving,
  markDriverArrived,

  verifyRideStartOtp,
  regenerateRideStartOtp,

  startRide,
  updateDriverLocation,
  completeRide,
  cancelRide,

  rateDriver,
  rateCustomer,

  releaseDriver
};