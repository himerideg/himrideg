const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  selectCashPayment,
  getPaymentStatus,
  confirmCashPayment,
  confirmOnlinePaymentReceipt,
  rejectLegacyAdvancePayment,
  getPaymentReceipt
} = require("../controllers/paymentController");

const {
  getDirectDriverPaymentDetails,
  claimDirectDriverPayment,
  confirmDirectDriverPayment,
  getDirectPaymentHistory
} = require("../controllers/directDriverPaymentController");

const {
  selectPaymentPlan,
  selectPaymentMethod,
  retrySettlement
} = require("../controllers/launchPaymentController");

const { protect } = require("../middlewares/auth");

const {
  paymentLimiter
} = require(
  "../middlewares/rateLimits"
);

router.use(protect);

/*
|--------------------------------------------------------------------------
| Payment Capacity Guard — ADD-ONLY
|--------------------------------------------------------------------------
| Existing controllers/webhooks unchanged. Authenticated POST bursts only.
*/

router.use(
  (req, res, next) => {
    if (req.method !== "POST") {
      return next();
    }

    return paymentLimiter(
      req,
      res,
      next
    );
  }
);

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

/*
|--------------------------------------------------------------------------
| Temporary Direct-to-Driver UPI — RazorpayX pending
|--------------------------------------------------------------------------
| Fare goes to driver's own saved UPI. Customer claim alone never marks the
| ride paid; assigned driver must verify money in their account and confirm.
| Financial settlement is intentionally cash-like so only 10% HimRideG fee is
| recorded as due/paid. No bank credentials are exposed to the customer.
*/
router.get("/direct-driver/history", getDirectPaymentHistory);
router.get("/:bookingId/direct-driver", getDirectDriverPaymentDetails);
router.post("/:bookingId/direct-driver/claim", claimDirectDriverPayment);
router.post("/:bookingId/direct-driver/confirm", confirmDirectDriverPayment);

/* Legacy web/app compatibility: online verification is already authoritative. */
router.post("/receive-confirm", confirmOnlinePaymentReceipt);

/* Legacy advance calls return a clear launch-safe response instead of 404. */
router.post("/advance/request", rejectLegacyAdvancePayment);
router.post("/advance/pay-later", rejectLegacyAdvancePayment);

/* Admin retry for legacy Route settlement; instant wallet settlement remains separate. */
router.post("/:bookingId/retry-settlement", retrySettlement);

/*
|--------------------------------------------------------------------------
| Get Payment Status
| GET /api/v2/payments/:bookingId/status
|--------------------------------------------------------------------------
*/
router.get("/:bookingId/status", getPaymentStatus);

/* Legacy client compatibility for older /payments/status/:bookingId callers. */
router.get("/status/:bookingId", getPaymentStatus);

/*
|--------------------------------------------------------------------------
| Get Payment Receipt
| GET /api/v2/payments/:bookingId/receipt
|--------------------------------------------------------------------------
*/
router.get("/:bookingId/receipt", getPaymentReceipt);

module.exports = router;
