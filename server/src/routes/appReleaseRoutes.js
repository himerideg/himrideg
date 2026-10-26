const router = require("express").Router();
router.get("/:appRole", require("../controllers/appReleaseController").getRelease);
module.exports = router;
