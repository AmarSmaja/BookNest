const router = require("express").Router();
const adminSellersController = require("../controllers/AdminSellersController");
const { requireAuth } = require("../middlewares/auth");

router.get("/seller-requests", requireAuth, adminSellersController.list);
router.post("/seller-requests/:userId/approve", requireAuth, adminSellersController.approve);
router.post("/seller-requests/:userId/reject", requireAuth, adminSellersController.reject);

module.exports = router;