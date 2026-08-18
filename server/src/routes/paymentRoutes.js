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
