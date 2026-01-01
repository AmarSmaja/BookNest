const router = require("express").Router();
const adminSellersController = require("../controllers/AdminSellersController");
const { requireRoles } = require("../middlewares/auth");

router.get("/seller-requests", requireRoles(["Admin"]), adminSellersController.list);
router.post("/seller-requests/:id/approve", requireRoles(["Admin"]), adminSellersController.approve);
router.post("/seller-requests/:id/reject", requireRoles(["Admin"]), adminSellersController.reject);

module.exports = router;