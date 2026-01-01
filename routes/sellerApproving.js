const router = require("express").Router();
const sellerApprovingController = require("../controllers/SellerApprovingController");
const { requireAuth } = require("../middlewares/auth");

router.get("/apply", requireAuth, sellerApprovingController.showApply);
router.post("/apply", requireAuth, sellerApprovingController.apply);

module.exports = router;