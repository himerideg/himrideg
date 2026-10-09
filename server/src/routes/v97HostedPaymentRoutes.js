const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  hostedCheckoutPage,
  hostedDonePage,
  syncOnlinePayment
} = require("../controllers/v97HostedPaymentController");

// V97: browser checkout pages (public; order id is the only key, paid status
// is always re-read from Razorpay on the server).
router.get("/v97/hosted/:orderId", hostedCheckoutPage);
router.get("/v97/hosted/:orderId/done", hostedDonePage);

// V97: app asks the server to re-check Razorpay for this booking's order.
router.post("/v97/sync", protect, syncOnlinePayment);

module.exports = router;
