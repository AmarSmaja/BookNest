const router = require("express").Router();
const sellerExchangesController = require("../controllers/SellerExchangesController");
const { requireRoles } = require("../middlewares/auth");

router.get("/exchanges", requireRoles(["Prodavac", "Admin"]), sellerExchangesController.list);
router.get("/exchanges/:id", requireRoles(["Prodavac", "Admin"]), sellerExchangesController.detail);
router.post("/exchanges/:id/status", requireRoles(["Prodavac", "Admin"]), sellerExchangesController.changeStatus);

module.exports = router;
