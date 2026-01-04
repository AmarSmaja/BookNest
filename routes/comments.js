const router = require("express").Router();
const bookCommentsController = require("../controllers/BookCommentsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/new", requireAuth, bookCommentsController.showNew);
router.post("/", requireAuth, bookCommentsController.create);
router.post("/:id/delete", requireAuth, bookCommentsController.remove);

module.exports = router;