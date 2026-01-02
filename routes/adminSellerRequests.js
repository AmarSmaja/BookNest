const router = require("express").Router();
const adminSellersController = require('../controllers/AdminSellersController');
const { requireRole } = require("../middlewares/auth");

router.get("/", requireRole("Admin"), adminSellersController.list);
router.post("/:userId/approve", requireRole("Admin"), adminSellersController.approve);
router.post("/:userId/reject", requireRole("Admin"), adminSellersController.reject);

module.exports = router;