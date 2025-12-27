const router = require("express").Router();
const exchangesController = require("../controllers/ExchangesController");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, exchangesController.list);
router.get("/:id", requireAuth, exchangesController.detail);

router.post("/", requireAuth, exchangesController.create);
router.post("/:id/cancel", requireAuth, exchangesController.cancel);

module.exports = router;
