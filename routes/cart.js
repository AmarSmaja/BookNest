const router = require("express").Router();
const CartController = require("../controllers/CartController");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, CartController.show);
router.post("/add", requireAuth, CartController.add);
router.post("/remove", requireAuth, CartController.remove);

module.exports = router;