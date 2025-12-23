const router = require("express").Router();
const sellerOrdersController = require("../controllers/SellerOrdersController");
const { requireRoles } = require("../middlewares/auth");

router.get("/orders", requireRoles(["Prodavac", "Admin"]), sellerOrdersController.list);
router.get("/orders/:id", requireRoles(["Prodavac", "Admin"]), sellerOrdersController.detail);
router.post("/orders/:id/status", requireRoles(["Prodavac", "Admin"]), sellerOrdersController.changeStatus);

module.exports = router;