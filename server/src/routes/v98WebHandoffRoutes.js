const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { createWebHandoff, exchangeWebHandoff } = require("../controllers/v98WebHandoffController");

router.post("/v98/web-handoff", protect, createWebHandoff);
router.post("/v98/web-handoff/exchange", exchangeWebHandoff);

module.exports = router;
