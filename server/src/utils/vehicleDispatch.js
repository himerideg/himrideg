/*
|--------------------------------------------------------------------------
| HimRideG V113 — Seat based dispatch (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| Request gaadi ke model se nahi, SEATS se jaati hai.
|
|   Booking category      ->  kin drivers ko request jaayegi
|   hatchback / sedan     ->  sab 4+1 seater (hatchback, sedan, custom 4+1,
|                             purane drivers jinka type set nahi hai)
|   suv (6 seater)        ->  sirf SUV drivers
|   traveller             ->  sirf Traveller drivers
|
| SUV / Traveller driver ko normal (hatchback/sedan) request NAHI jaati.
|--------------------------------------------------------------------------
*/

const FOUR_SEATER_TYPES = ["hatchback", "sedan", "other", "bike", "", null];
const SIX_SEATER_TYPES = ["suv"];
const TRAVELLER_TYPES = ["traveller"];

/* Car names shown in apps/website (driver registration + booking hints). */
const VEHICLE_MODEL_CATALOG = {
  hatchback: [
    "Alto", "S-Presso", "Kwid", "Celerio", "WagonR", "Swift",
    "Grand i10", "Glanza", "Baleno", "Tiago"
  ],
  sedan: [
    "Swift Dzire", "Toyota Etios", "Hyundai Aura", "Xcent",
    "Honda Amaze", "Tigor", "Ciaz", "Honda City"
  ],
  suv: [
    "Innova Crysta", "Innova", "Ertiga", "XL6", "Scorpio",
    "Bolero", "Xylo", "Marazzo", "Carens"
  ],
  traveller: ["Tempo Traveller", "Force Urbania"]
};

function normalizeVehicleCategory(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (["mini", "small", "hatch", "hatchback", "4", "4+1"].includes(text)) return "hatchback";
  if (["sedan", "saloon"].includes(text)) return "sedan";
  if (["suv", "6", "6+1", "6_seater", "6-seater", "six_seater", "muv"].includes(text)) return "suv";
  if (["traveller", "traveler", "tempo", "tempo_traveller", "tempo traveller"].includes(text)) return "traveller";
  return text;
}

function isNormalBookingCategory(value) {
  const category = normalizeVehicleCategory(value);
  return !category || category === "hatchback" || category === "sedan" || category === "other" || category === "bike";
}

/*
| Mongo filter fragment for User ($geoNear query) — which drivers may get
| this booking.
*/
function driverVehicleQueryForBooking(bookingVehicleType) {
  const category = normalizeVehicleCategory(bookingVehicleType);

  if (category === "suv") {
    return { "driverProfile.vehicle.vehicleType": { $in: SIX_SEATER_TYPES } };
  }

  if (category === "traveller") {
    return { "driverProfile.vehicle.vehicleType": { $in: TRAVELLER_TYPES } };
  }

  /* normal booking: every driver that is NOT suv / traveller */
  return {
    "driverProfile.vehicle.vehicleType": {
      $nin: [...SIX_SEATER_TYPES, ...TRAVELLER_TYPES]
    }
  };
}

/*
| Mongo filter fragment for Booking — which bookings this driver may see.
*/
function bookingVehicleQueryForDriver(driverVehicleType) {
  const category = normalizeVehicleCategory(driverVehicleType);

  if (category === "suv") {
    return { vehicleType: { $in: SIX_SEATER_TYPES } };
  }

  if (category === "traveller") {
    return { vehicleType: { $in: TRAVELLER_TYPES } };
  }

  return {
    vehicleType: { $nin: [...SIX_SEATER_TYPES, ...TRAVELLER_TYPES] }
  };
}

function driverCanTakeBooking(driverVehicleType, bookingVehicleType) {
  const driverCategory = normalizeVehicleCategory(driverVehicleType);
  const bookingCategory = normalizeVehicleCategory(bookingVehicleType);

  if (bookingCategory === "suv") return driverCategory === "suv";
  if (bookingCategory === "traveller") return driverCategory === "traveller";
  return driverCategory !== "suv" && driverCategory !== "traveller";
}

/* Model name -> category (custom names fall back to the chosen category). */
function categoryForModel(modelName, fallback = "hatchback") {
  const text = String(modelName || "").trim().toLowerCase();
  if (!text) return normalizeVehicleCategory(fallback) || "hatchback";
  for (const [category, names] of Object.entries(VEHICLE_MODEL_CATALOG)) {
    if (names.some((name) => name.toLowerCase() === text)) return category;
  }
  return normalizeVehicleCategory(fallback) || "hatchback";
}

module.exports = {
  FOUR_SEATER_TYPES,
  SIX_SEATER_TYPES,
  TRAVELLER_TYPES,
  VEHICLE_MODEL_CATALOG,
  normalizeVehicleCategory,
  isNormalBookingCategory,
  driverVehicleQueryForBooking,
  bookingVehicleQueryForDriver,
  driverCanTakeBooking,
  categoryForModel
};
