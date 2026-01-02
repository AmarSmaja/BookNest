const router = require("express").Router();
const reportsController = require("../controllers/ReportsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/new", requireAuth, reportsController.showCreate);
router.post("/", requireAuth, reportsController.create);

module.exports = router;