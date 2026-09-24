const express =
  require("express");

const {
  protect,
  allowRoles
} = require(
  "../middlewares/auth"
);

const upload =
  require(
    "../middlewares/upload"
  );

const driverController =
  require(
    "../controllers/driverController"
  );

const walletController =
  require(
    "../controllers/walletController"
  );

const platformFeeController =
  require(
    "../controllers/platformFeeController"
  );

const {
  getDriverTestMode
} = require(
  "../controllers/driverTestModeController"
);

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Protect Driver Routes
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(allowRoles("driver"));

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  driverController
    .getDashboard
);

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  driverController
    .getProfile
);

router.patch(
  "/profile",
  driverController
    .updateProfile
);

router.post(
  "/profile/photo",
  upload.single(
    "profilePhoto"
  ),
  driverController
    .uploadProfilePhoto
);

/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

router.post(
  "/documents/:documentType",
  upload.single(
    "document"
  ),
  driverController
    .uploadDocument
);

router.get(
  "/documents/:documentId/file",
  driverController
    .downloadDocument
);

/*
|--------------------------------------------------------------------------
| Current Ride
|--------------------------------------------------------------------------
*/

router.get(
  "/current-ride",
  driverController
    .getCurrentRide
);

/*
|--------------------------------------------------------------------------
| Online / Offline
|--------------------------------------------------------------------------
*/

router.patch(
  "/go-online",
  driverController
    .goOnline
);

router.patch(
  "/go-offline",
  driverController
    .goOffline
);

/*
|--------------------------------------------------------------------------
| Availability
|--------------------------------------------------------------------------
*/

router.patch(
  "/available",
  driverController
    .becomeAvailable
);

router.patch(
  "/busy",
  driverController
    .becomeBusy
);

/*
|--------------------------------------------------------------------------
| Location
|--------------------------------------------------------------------------
*/

router.patch(
  "/location",
  driverController
    .updateLocation
);

/*
|--------------------------------------------------------------------------
| Driver Warnings
|--------------------------------------------------------------------------
*/

router.get(
  "/warnings",
  driverController
    .getWarnings
);

router.patch(
  "/warnings/:warningId/acknowledge",
  driverController
    .acknowledgeWarning
);

router.patch(
  "/warnings/:warningId/reply",
  driverController
    .replyToWarning
);

/*
|--------------------------------------------------------------------------
| Onboarding (Documents + Vehicle Verification)
|--------------------------------------------------------------------------
*/

router.get(
  "/onboarding",
  driverController
    .getOnboardingStatus
);

router.patch(
  "/vehicle",
  driverController
    .updateVehicleDetails
);

router.post(
  "/submit-approval",
  driverController
    .submitForApproval
);

/*
|--------------------------------------------------------------------------
| Admin Managed Test Mode
|--------------------------------------------------------------------------
*/

router.get(
  "/test-mode",
  getDriverTestMode
);

/*
|--------------------------------------------------------------------------
| Platform Fee — temporary direct-driver-payment model
|--------------------------------------------------------------------------
| Driver can keep accepting while due < ₹100. At ₹100+ the ride request is
| still visible, but ride acceptance is blocked server-side until this fee is
| paid below the threshold. These endpoints use normal Razorpay Payments, not
| RazorpayX, so they work while payout activation is pending.
*/

router.get(
  "/platform-fee",
  platformFeeController
    .getPlatformFeeStatus
);

router.post(
  "/platform-fee/create-order",
  platformFeeController
    .createPlatformFeeOrder
);

router.post(
  "/platform-fee/verify",
  platformFeeController
    .verifyPlatformFee
);

/*
|--------------------------------------------------------------------------
| Wallet / Payout
|--------------------------------------------------------------------------
*/

router.get(
  "/wallet",
  walletController
    .getWallet
);

router.patch(
  "/wallet/payout-settings",
  walletController
    .savePayoutSettings
);

router.post(
  "/wallet/payout-methods",
  walletController
    .addPayoutMethod
);

router.patch(
  "/wallet/payout-methods/:methodId/primary",
  walletController
    .setPrimaryPayoutMethod
);

router.delete(
  "/wallet/payout-methods/:methodId",
  walletController
    .deletePayoutMethod
);

router.get(
  "/wallet/withdrawals",
  walletController
    .getWithdrawalHistory
);

router.post(
  "/wallet/withdrawals/:withdrawalId/retry",
  walletController
    .retryWithdrawal
);

router.post(
  "/wallet/withdraw",
  walletController
    .requestWithdrawal
);

router.post(
  "/wallet/reconcile",
  walletController
    .reconcilePayouts
);

// Backward compatibility: purana frontend endpoint bhi same secure payout flow use kare.
router.post(
  "/withdrawal",
  walletController
    .requestWithdrawal
);

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports =
  router;