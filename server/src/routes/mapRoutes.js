const express = require("express");
const mapController = require("../controllers/mapController");
const { mutationLimiter } = require("../middlewares/rateLimits");

const router = express.Router();

router.get("/health", mapController.health);
router.get("/autocomplete", mutationLimiter, mapController.autocomplete);
router.get("/reverse", mutationLimiter, mapController.reverse);
router.get("/route", mutationLimiter, mapController.route);

module.exports = router;
