const router = require("express").Router();
const ordersController = require("../controllers/OrdersController");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ordersController.myOrders);
router.post("/checkout", requireAuth, ordersController.checkout);

module.exports = router;