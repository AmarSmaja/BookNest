const express = require("express");
const router = express.Router();

const adminLookupsController = require("../controllers/AdminLookupsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/:type", requireAuth, adminLookupsController.list.bind(adminLookupsController));
router.post("/:type/create", requireAuth, adminLookupsController.create.bind(adminLookupsController));
router.post("/:type/:id/update", requireAuth, adminLookupsController.update.bind(adminLookupsController));
router.post("/:type/:id/delete", requireAuth, adminLookupsController.remove.bind(adminLookupsController));

module.exports = router;