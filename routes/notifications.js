const router = require("express").Router();
const ctrl = require("../controllers/NotificationsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.list);
router.post("/:id/read", requireAuth, ctrl.oznaciProcitano);
router.post("/read-all", requireAuth, ctrl.oznaciSveProcitano);

module.exports = router;