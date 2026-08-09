const ApiError = require("../utils/ApiError");

function getNumber(value, fieldName) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new ApiError(
      400,
      `${fieldName} must be a valid number`
    );
  }

  return numberValue;
}

function validateDriverLocation(body) {
  if (!body || typeof body !== "object") {
    throw new ApiError(
      400,
      "Location data is required"
    );
  }

  const latitude = getNumber(
    body.latitude,
    "Latitude"
  );

  const longitude = getNumber(
    body.longitude,
    "Longitude"
  );

  if (latitude < -90 || latitude > 90) {
    throw new ApiError(
      400,
      "Latitude must be between -90 and 90"
    );
  }

  if (longitude < -180 || longitude > 180) {
    throw new ApiError(
      400,
      "Longitude must be between -180 and 180"
    );
  }

  return {
    latitude,
    longitude
  };
}

module.exports = {
  validateDriverLocation
};