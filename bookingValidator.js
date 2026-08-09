const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

const ALLOWED_VEHICLE_TYPES = [
  "hatchback",
  "sedan",
  "suv",
  "traveller",
  "other"
];

const ALLOWED_PAYMENT_METHODS = [
  "cash",
  "online",
  "wallet"
];

const getString = (value) => {
  return String(value ?? "").trim();
};

const getNumber = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new ApiError(
      400,
      `${fieldName} must be a valid number`
    );
  }

  return numberValue;
};

const validateCoordinates = (
  coordinates,
  fieldName
) => {
  if (
    !coordinates ||
    typeof coordinates !== "object"
  ) {
    throw new ApiError(
      400,
      `${fieldName} coordinates are required`
    );
  }

  const latitude = getNumber(
    coordinates.latitude,
    `${fieldName} latitude`
  );

  const longitude = getNumber(
    coordinates.longitude,
    `${fieldName} longitude`
  );

  if (latitude < -90 || latitude > 90) {
    throw new ApiError(
      400,
      `${fieldName} latitude must be between -90 and 90`
    );
  }

  if (longitude < -180 || longitude > 180) {
    throw new ApiError(
      400,
      `${fieldName} longitude must be between -180 and 180`
    );
  }

  return {
    latitude,
    longitude
  };
};

const validateAddress = (
  address,
  fieldName
) => {
  const normalizedAddress = getString(address);

  if (!normalizedAddress) {
    throw new ApiError(
      400,
      `${fieldName} address is required`
    );
  }

  if (normalizedAddress.length < 3) {
    throw new ApiError(
      400,
      `${fieldName} address must contain at least 3 characters`
    );
  }

  if (normalizedAddress.length > 250) {
    throw new ApiError(
      400,
      `${fieldName} address cannot exceed 250 characters`
    );
  }

  return normalizedAddress;
};

const validateTravelDate = (value) => {
  const travelDate = value
    ? new Date(value)
    : new Date();

  if (Number.isNaN(travelDate.getTime())) {
    throw new ApiError(
      400,
      "Please provide a valid travel date"
    );
  }

  const fiveMinutesAgo =
    Date.now() - 5 * 60 * 1000;

  if (travelDate.getTime() < fiveMinutesAgo) {
    throw new ApiError(
      400,
      "Travel date cannot be in the past"
    );
  }

  return travelDate;
};

const validateCreateBooking = (body) => {
  const pickupAddress = validateAddress(
    body?.pickup?.address,
    "Pickup"
  );

  const dropoffAddress = validateAddress(
    body?.dropoff?.address,
    "Dropoff"
  );

  const pickupCoordinates =
    validateCoordinates(
      body?.pickup?.coordinates,
      "Pickup"
    );

  const dropoffCoordinates =
    validateCoordinates(
      body?.dropoff?.coordinates,
      "Dropoff"
    );

  const distanceKm = getNumber(
    body?.distanceKm,
    "Distance"
  );

  if (distanceKm <= 0) {
    throw new ApiError(
      400,
      "Distance must be greater than zero"
    );
  }

  if (distanceKm > 2000) {
    throw new ApiError(
      400,
      "Distance cannot exceed 2000 kilometres"
    );
  }

  const passengers =
    body?.passengers === undefined
      ? 1
      : getNumber(
          body.passengers,
          "Passengers"
        );

  if (
    !Number.isInteger(passengers) ||
    passengers < 1 ||
    passengers > 20
  ) {
    throw new ApiError(
      400,
      "Passengers must be a whole number between 1 and 20"
    );
  }

  const estimatedDurationMinutes =
    body?.estimatedDurationMinutes === undefined
      ? 0
      : getNumber(
          body.estimatedDurationMinutes,
          "Estimated duration"
        );

  if (estimatedDurationMinutes < 0) {
    throw new ApiError(
      400,
      "Estimated duration cannot be negative"
    );
  }

  const vehicleType =
    getString(body?.vehicleType) ||
    "hatchback";

  if (
    !ALLOWED_VEHICLE_TYPES.includes(
      vehicleType
    )
  ) {
    throw new ApiError(
      400,
      `Vehicle type must be one of: ${ALLOWED_VEHICLE_TYPES.join(
        ", "
      )}`
    );
  }

  const paymentMethod =
    getString(body?.paymentMethod) ||
    "cash";

  if (
    !ALLOWED_PAYMENT_METHODS.includes(
      paymentMethod
    )
  ) {
    throw new ApiError(
      400,
      `Payment method must be one of: ${ALLOWED_PAYMENT_METHODS.join(
        ", "
      )}`
    );
  }

  const note = getString(body?.note);

  if (note.length > 500) {
    throw new ApiError(
      400,
      "Note cannot exceed 500 characters"
    );
  }

  const fare = body?.fare || {};

  const baseFare =
    fare.baseFare === undefined
      ? 0
      : getNumber(
          fare.baseFare,
          "Base fare"
        );

  const distanceFare =
    fare.distanceFare === undefined
      ? 0
      : getNumber(
          fare.distanceFare,
          "Distance fare"
        );

  const waitingCharge =
    fare.waitingCharge === undefined
      ? 0
      : getNumber(
          fare.waitingCharge,
          "Waiting charge"
        );

  const platformFee =
    fare.platformFee === undefined
      ? 0
      : getNumber(
          fare.platformFee,
          "Platform fee"
        );

  const discount =
    fare.discount === undefined
      ? 0
      : getNumber(
          fare.discount,
          "Discount"
        );

  const taxes =
    fare.taxes === undefined
      ? 0
      : getNumber(
          fare.taxes,
          "Taxes"
        );

  const totalFare =
    fare.totalFare === undefined
      ? baseFare +
        distanceFare +
        waitingCharge +
        platformFee +
        taxes -
        discount
      : getNumber(
          fare.totalFare,
          "Total fare"
        );

  const fareValues = [
    baseFare,
    distanceFare,
    waitingCharge,
    platformFee,
    discount,
    taxes,
    totalFare
  ];

  if (
    fareValues.some((value) => value < 0)
  ) {
    throw new ApiError(
      400,
      "Fare values cannot be negative"
    );
  }

  return {
    pickup: {
      address: pickupAddress,
      coordinates: pickupCoordinates
    },

    dropoff: {
      address: dropoffAddress,
      coordinates: dropoffCoordinates
    },

    travelDate: validateTravelDate(
      body?.travelDate
    ),

    passengers,
    vehicleType,
    distanceKm,
    estimatedDurationMinutes,

    fare: {
      baseFare,
      distanceFare,
      waitingCharge,
      platformFee,
      discount,
      taxes,
      totalFare
    },

    paymentMethod,
    note
  };
};

const validateBookingId = (bookingId) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      bookingId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid booking ID"
    );
  }

  return bookingId;
};

module.exports = {
  validateCreateBooking,
  validateBookingId
};