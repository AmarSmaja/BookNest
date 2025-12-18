const router = require("express").Router();
const adminUsersController = require("../controllers/AdminUsersController");
const { requireRole } = require("../middlewares/auth");

router.get("/users", requireRole("Admin"), adminUsersController.list);
router.post("/users/:id/role", requireRole("Admin"), adminUsersController.changeRole);
router.post("/users/:id/status", requireRole("Admin"), adminUsersController.changeStatus);
router.post("/users/:id/block", requireRole("Admin"), adminUsersController.block);
router.post("/users/:id/unblock", requireRole("Admin"), adminUsersController.unblock);

module.exports = router;