const express = require("express");
const router = express.Router();

const adminStatsController = require("../controllers/AdminStatsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, adminStatsController.index.bind(adminStatsController));

module.exports = router;