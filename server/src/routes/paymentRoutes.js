const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  selectCashPayment,
  getPaymentStatus,
  confirmCashPayment,
  getPaymentReceipt
} = require("../controllers/paymentController");

const {
  selectPaymentPlan,
  selectPaymentMethod,
  retrySettlement
} = require("../controllers/launchPaymentController");

const { protect } = require("../middlewares/auth");

router.use(protect);

/*
|--------------------------------------------------------------------------
| Create Razorpay Order
| POST /api/v2/payments/create-order
|--------------------------------------------------------------------------
*/
router.post("/create-order", createPaymentOrder);

/*
|--------------------------------------------------------------------------
| Verify Razorpay Payment
| POST /api/v2/payments/verify
|--------------------------------------------------------------------------
*/
router.post("/verify", verifyPayment);

/* ADD-ONLY: fare-lock payment plan compatibility */
router.post("/select-plan", selectPaymentPlan);
router.post("/select-method", selectPaymentMethod);

/* Payment failure audit */
router.post("/failed", markPaymentFailed);

/* Customer selects cash; driver will confirm after receiving cash */
router.post("/cash-select", selectCashPayment);

/*
|--------------------------------------------------------------------------
| Cash Payment Confirm
| POST /api/v2/payments/cash-confirm
|--------------------------------------------------------------------------
*/
router.post("/cash-confirm", confirmCashPayment);

/* Admin retry for legacy Route settlement; instant wallet settlement remains separate. */
router.post("/:bookingId/retry-settlement", retrySettlement);

/*
|--------------------------------------------------------------------------
| Get Payment Status
| GET /api/v2/payments/:bookingId/status
|--------------------------------------------------------------------------
*/
router.get("/:bookingId/status", getPaymentStatus);

/*
|--------------------------------------------------------------------------
| Get Payment Receipt
| GET /api/v2/payments/:bookingId/receipt
|--------------------------------------------------------------------------
*/
router.get("/:bookingId/receipt", getPaymentReceipt);

module.exports = router;
