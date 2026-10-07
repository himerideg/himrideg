const express = require("express");

const { protect } = require("../middlewares/auth");
const { loginLimiter, mutationLimiter } = require("../middlewares/rateLimits");
const supportController = require("../controllers/supportController");

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Support Routes (ADD-ONLY NEW FILE)
| Mounted at /api/v2/support
|--------------------------------------------------------------------------
*/

const router = express.Router();

/* Public — login ke bina (email/login bhool gaye). Rate limited. */
router.post(
  "/account-deletion/public",
  loginLimiter,
  supportController.requestPublicAccountDeletion
);

router.use(protect);

router.post("/complaints", mutationLimiter, supportController.createComplaint);
router.get("/complaints/mine", supportController.getMyComplaints);

router.get("/account-deletion", supportController.getMyDeletionRequest);
router.post("/account-deletion", mutationLimiter, supportController.requestAccountDeletion);
router.post("/account-deletion/cancel", supportController.cancelMyDeletionRequest);

module.exports = router;
