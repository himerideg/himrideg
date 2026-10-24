const express = require("express");
const mapController = require("../controllers/mapController");
const { mutationLimiter } = require("../middlewares/rateLimits");

const router = express.Router();

router.get("/health", mapController.health);
router.get("/autocomplete", mutationLimiter, mapController.autocomplete);
router.get("/reverse", mutationLimiter, mapController.reverse);
router.get("/route", mutationLimiter, mapController.route);

/* V106 ADD-ONLY: nearby cars on home map (own bucket so polling never blocks search) */
const { rateLimit: v106RateLimit } = require("express-rate-limit");
const v106NearbyLimiter = v106RateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Thodi der baad try karein." }
});
router.get("/nearby-drivers", v106NearbyLimiter, mapController.nearbyDrivers);

module.exports = router;
