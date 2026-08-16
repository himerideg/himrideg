const express = require("express");
const router = express.Router();

/*
|--------------------------------------------------------------------------
| Legacy Payment Controller
|--------------------------------------------------------------------------
|
| Purana controller code preserve hai. Launch routes neeche hardened
| controller use karte hain.
|
*/
const legacyPaymentController = require("../controllers/paymentController");

const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  confirmCashPayment,
  getPaymentReceipt,
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

/*
|--------------------------------------------------------------------------
| Cash Payment Confirm
| POST /api/v2/payments/cash-confirm
|--------------------------------------------------------------------------
*/
router.post("/cash-confirm", confirmCashPayment);

/*
|--------------------------------------------------------------------------
| Retry Online Driver Settlement — Admin Only
|--------------------------------------------------------------------------
*/
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
