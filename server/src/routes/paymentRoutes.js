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
  selectPaymentPlan,
  selectPaymentMethod,
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
| Customer Select Fare-Lock Payment Plan
| POST /api/v2/payments/select-plan
|--------------------------------------------------------------------------
*/
router.post("/select-plan", selectPaymentPlan);

/*
|--------------------------------------------------------------------------
| Customer Select Payment Method
| POST /api/v2/payments/select-method
|--------------------------------------------------------------------------
| Ride completed + final fare locked hone ke baad customer Online/Cash
| choice select kar sakta hai. Cash selection ko paid nahi maana jaata.
*/
router.post("/select-method", selectPaymentMethod);

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
