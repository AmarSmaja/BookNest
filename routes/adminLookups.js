const express = require("express");
const router = express.Router();

const adminLookupsController = require("../controllers/AdminLookupsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/:type", requireAuth, adminLookupsController.list);
router.post("/:type/create", requireAuth, adminLookupsController.create);
router.post("/:type/:id/update", requireAuth, adminLookupsController.update);
router.post("/:type/:id/delete", requireAuth, adminLookupsController.remove);

module.exports = router;