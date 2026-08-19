const express = require("express");
const { protect, allowRoles } = require("../middlewares/auth");
const { paymentLimiter, mutationLimiter } = require("../middlewares/rateLimits");
const walletController = require("../controllers/legacyWalletController");

const router = express.Router();
router.use(protect);
router.use(allowRoles("driver"));

router.get("/", walletController.getDriverWallet);
router.post("/topup/create-order", paymentLimiter, walletController.createTopupOrder);
router.post("/topup/verify", paymentLimiter, walletController.verifyTopup);
router.post("/withdrawals", mutationLimiter, walletController.requestWithdrawal);
router.get("/withdrawals", walletController.getMyWithdrawals);

module.exports = router;
