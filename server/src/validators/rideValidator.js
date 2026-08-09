const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const MIN_SEARCH_RADIUS_METERS = 100;
const MAX_SEARCH_RADIUS_METERS = 100000;

const MIN_DRIVER_LIMIT = 1;
const MAX_DRIVER_LIMIT = 100;

const MIN_REQUEST_TIMEOUT_SECONDS = 5;
const MAX_REQUEST_TIMEOUT_SECONDS = 600;

const MIN_RATING = 1;
const MAX_RATING = 5;

const MAX_REVIEW_LENGTH = 1000;
const MAX_CANCELLATION_REASON_LENGTH = 500;

const MAX_ACTUAL_DISTANCE_KM = 10000;
const MAX_ACTUAL_DURATION_MINUTES = 100000;
const MAX_FINAL_FARE = 10000000;

const MAX_SPEED_KMPH = 500;
const MAX_LOCATION_ACCURACY_METERS = 10000;

/*
|--------------------------------------------------------------------------
| Basic Helpers
|--------------------------------------------------------------------------
*/

const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    value === ""
  );
};

const getString = (value) => {
  return String(value ?? "").trim();
};

const getNumber = (
  value,
  fieldName
) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new ApiError(
      400,
      `${fieldName} must be a valid number`
    );
  }

  return numberValue;
};

const getInteger = (
  value,
  fieldName
) => {
  const numberValue = getNumber(
    value,
    fieldName
  );

  if (!Number.isInteger(numberValue)) {
    throw new ApiError(
      400,
      `${fieldName} must be a whole number`
    );
  }

  return numberValue;
};

const validateNumberRange = ({
  value,
  fieldName,
  minimum,
  maximum
}) => {
  const numberValue = getNumber(
    value,
    fieldName
  );

  if (
    minimum !== undefined &&
    numberValue < minimum
  ) {
    throw new ApiError(
      400,
      `${fieldName} must be at least ${minimum}`
    );
  }

  if (
    maximum !== undefined &&
    numberValue > maximum
  ) {
    throw new ApiError(
      400,
      `${fieldName} cannot exceed ${maximum}`
    );
  }

  return numberValue;
};

const validateIntegerRange = ({
  value,
  fieldName,
  minimum,
  maximum
}) => {
  const numberValue = getInteger(
    value,
    fieldName
  );

  if (
    minimum !== undefined &&
    numberValue < minimum
  ) {
    throw new ApiError(
      400,
      `${fieldName} must be at least ${minimum}`
    );
  }

  if (
    maximum !== undefined &&
    numberValue > maximum
  ) {
    throw new ApiError(
      400,
      `${fieldName} cannot exceed ${maximum}`
    );
  }

  return numberValue;
};

/*
|--------------------------------------------------------------------------
| Object ID Validators
|--------------------------------------------------------------------------
*/

const validateObjectId = (
  value,
  fieldName
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      value
    )
  ) {
    throw new ApiError(
      400,
      `Invalid ${fieldName}`
    );
  }

  return String(value);
};

const validateBookingId = (
  bookingId
) => {
  return validateObjectId(
    bookingId,
    "booking ID"
  );
};

const validateCustomerId = (
  customerId
) => {
  return validateObjectId(
    customerId,
    "customer ID"
  );
};

const validateDriverId = (
  driverId
) => {
  return validateObjectId(
    driverId,
    "driver ID"
  );
};

/*
|--------------------------------------------------------------------------
| Nearby Driver Search Validator
|--------------------------------------------------------------------------
*/

const validateNearbyDriversQuery = (
  query = {}
) => {
  const validatedQuery = {};

  if (
    !isEmpty(query.radiusMeters)
  ) {
    validatedQuery.radiusMeters =
      validateNumberRange({
        value: query.radiusMeters,
        fieldName:
          "Search radius",
        minimum:
          MIN_SEARCH_RADIUS_METERS,
        maximum:
          MAX_SEARCH_RADIUS_METERS
      });
  }

  if (!isEmpty(query.limit)) {
    validatedQuery.limit =
      validateIntegerRange({
        value: query.limit,
        fieldName:
          "Driver limit",
        minimum:
          MIN_DRIVER_LIMIT,
        maximum:
          MAX_DRIVER_LIMIT
      });
  }

  return validatedQuery;
};

/*
|--------------------------------------------------------------------------
| Dispatch Ride Validator
|--------------------------------------------------------------------------
*/

const validateDispatchRide = (
  body = {}
) => {
  const validatedData = {};

  if (
    !isEmpty(body.radiusMeters)
  ) {
    validatedData.radiusMeters =
      validateNumberRange({
        value: body.radiusMeters,
        fieldName:
          "Search radius",
        minimum:
          MIN_SEARCH_RADIUS_METERS,
        maximum:
          MAX_SEARCH_RADIUS_METERS
      });
  }

  if (!isEmpty(body.limit)) {
    validatedData.limit =
      validateIntegerRange({
        value: body.limit,
        fieldName:
          "Driver limit",
        minimum:
          MIN_DRIVER_LIMIT,
        maximum:
          MAX_DRIVER_LIMIT
      });
  }

  if (
    !isEmpty(body.timeoutSeconds)
  ) {
    validatedData.timeoutSeconds =
      validateIntegerRange({
        value:
          body.timeoutSeconds,
        fieldName:
          "Request timeout",
        minimum:
          MIN_REQUEST_TIMEOUT_SECONDS,
        maximum:
          MAX_REQUEST_TIMEOUT_SECONDS
      });
  }

  return validatedData;
};

/*
|--------------------------------------------------------------------------
| Ride Start OTP Validator
|--------------------------------------------------------------------------
*/

const validateRideStartOtp = (
  body = {}
) => {
  const otp = getString(body.otp);

  if (!otp) {
    throw new ApiError(
      400,
      "Ride start OTP is required"
    );
  }

  if (!/^\d{4,6}$/.test(otp)) {
    throw new ApiError(
      400,
      "Ride start OTP must contain 4 to 6 digits"
    );
  }

  return {
    otp
  };
};

/*
|--------------------------------------------------------------------------
| Driver Live Location Validator
|--------------------------------------------------------------------------
*/

const validateDriverLocation = (
  body = {}
) => {
  if (isEmpty(body.latitude)) {
    throw new ApiError(
      400,
      "Latitude is required"
    );
  }

  if (isEmpty(body.longitude)) {
    throw new ApiError(
      400,
      "Longitude is required"
    );
  }

  const latitude =
    validateNumberRange({
      value: body.latitude,
      fieldName: "Latitude",
      minimum: -90,
      maximum: 90
    });

  const longitude =
    validateNumberRange({
      value: body.longitude,
      fieldName: "Longitude",
      minimum: -180,
      maximum: 180
    });

  let heading = null;
  let speed = null;
  let accuracy = null;

  if (!isEmpty(body.heading)) {
    heading =
      validateNumberRange({
        value: body.heading,
        fieldName: "Heading",
        minimum: 0,
        maximum: 360
      });
  }

  if (!isEmpty(body.speed)) {
    speed =
      validateNumberRange({
        value: body.speed,
        fieldName: "Speed",
        minimum: 0,
        maximum: MAX_SPEED_KMPH
      });
  }

  if (!isEmpty(body.accuracy)) {
    accuracy =
      validateNumberRange({
        value: body.accuracy,
        fieldName:
          "Location accuracy",
        minimum: 0,
        maximum:
          MAX_LOCATION_ACCURACY_METERS
      });
  }

  return {
    latitude,
    longitude,
    heading,
    speed,
    accuracy
  };
};

/*
|--------------------------------------------------------------------------
| Complete Ride Validator
|--------------------------------------------------------------------------
*/

const validateCompleteRide = (
  body = {}
) => {
  let actualDistanceKm = null;
  let actualDurationMinutes = null;
  let finalFare = null;

  if (
    !isEmpty(body.actualDistanceKm)
  ) {
    actualDistanceKm =
      validateNumberRange({
        value:
          body.actualDistanceKm,
        fieldName:
          "Actual distance",
        minimum: 0,
        maximum:
          MAX_ACTUAL_DISTANCE_KM
      });
  }

  if (
    !isEmpty(
      body.actualDurationMinutes
    )
  ) {
    actualDurationMinutes =
      validateNumberRange({
        value:
          body.actualDurationMinutes,
        fieldName:
          "Actual duration",
        minimum: 0,
        maximum:
          MAX_ACTUAL_DURATION_MINUTES
      });
  }

  if (!isEmpty(body.finalFare)) {
    finalFare =
      validateNumberRange({
        value: body.finalFare,
        fieldName: "Final fare",
        minimum: 0,
        maximum: MAX_FINAL_FARE
      });
  }

  return {
    actualDistanceKm,
    actualDurationMinutes,
    finalFare
  };
};

/*
|--------------------------------------------------------------------------
| Cancel Ride Validator
|--------------------------------------------------------------------------
*/

const validateCancelRide = (
  body = {}
) => {
  const reason = getString(
    body.reason
  );

  if (!reason) {
    throw new ApiError(
      400,
      "Cancellation reason is required"
    );
  }

  if (reason.length < 3) {
    throw new ApiError(
      400,
      "Cancellation reason must contain at least 3 characters"
    );
  }

  if (
    reason.length >
    MAX_CANCELLATION_REASON_LENGTH
  ) {
    throw new ApiError(
      400,
      `Cancellation reason cannot exceed ${MAX_CANCELLATION_REASON_LENGTH} characters`
    );
  }

  const cancellationCharge =
    isEmpty(
      body.cancellationCharge
    )
      ? 0
      : validateNumberRange({
          value:
            body.cancellationCharge,
          fieldName:
            "Cancellation charge",
          minimum: 0,
          maximum: 100000
        });

  return {
    reason,
    cancellationCharge
  };
};

/*
|--------------------------------------------------------------------------
| Optional Cancel Ride Validator
|--------------------------------------------------------------------------
*/

const validateOptionalCancelRide = (
  body = {}
) => {
  const reason = getString(
    body.reason
  );

  if (
    reason &&
    reason.length < 3
  ) {
    throw new ApiError(
      400,
      "Cancellation reason must contain at least 3 characters"
    );
  }

  if (
    reason.length >
    MAX_CANCELLATION_REASON_LENGTH
  ) {
    throw new ApiError(
      400,
      `Cancellation reason cannot exceed ${MAX_CANCELLATION_REASON_LENGTH} characters`
    );
  }

  const cancellationCharge =
    isEmpty(
      body.cancellationCharge
    )
      ? 0
      : validateNumberRange({
          value:
            body.cancellationCharge,
          fieldName:
            "Cancellation charge",
          minimum: 0,
          maximum: 100000
        });

  return {
    reason,
    cancellationCharge
  };
};

/*
|--------------------------------------------------------------------------
| Rating Validator
|--------------------------------------------------------------------------
*/

const validateRating = (
  body = {}
) => {
  if (isEmpty(body.rating)) {
    throw new ApiError(
      400,
      "Rating is required"
    );
  }

  const rating =
    validateIntegerRange({
      value: body.rating,
      fieldName: "Rating",
      minimum: MIN_RATING,
      maximum: MAX_RATING
    });

  const review = getString(
    body.review
  );

  if (
    review.length >
    MAX_REVIEW_LENGTH
  ) {
    throw new ApiError(
      400,
      `Review cannot exceed ${MAX_REVIEW_LENGTH} characters`
    );
  }

  return {
    rating,
    review
  };
};

/*
|--------------------------------------------------------------------------
| Empty Body Validator
|--------------------------------------------------------------------------
*/

const validateEmptyBody = (
  body = {}
) => {
  if (
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    Object.keys(body).length > 0
  ) {
    throw new ApiError(
      400,
      "Request body must be empty"
    );
  }

  return {};
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  validateBookingId,
  validateCustomerId,
  validateDriverId,

  validateNearbyDriversQuery,
  validateDispatchRide,

  validateRideStartOtp,
  validateDriverLocation,
  validateCompleteRide,

  validateCancelRide,
  validateOptionalCancelRide,

  validateRating,
  validateEmptyBody
};