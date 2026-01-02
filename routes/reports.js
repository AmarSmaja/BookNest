const router = require("express").Router();
const adminReportsController = require("../controllers/AdminReportsController");

router.get("/", adminReportsController.list);
router.get("/:id", adminReportsController.detail);
router.post("/:id/status", adminReportsController.changeStatus);

module.exports = router;