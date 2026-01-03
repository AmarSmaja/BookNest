const router = require("express").Router();
const bookRatingsController = require("../controllers/BookRatingsController");
const { requireAuth } = require("../middlewares/auth");

router.get("/new", requireAuth, bookRatingsController.showNew);
router.post("/", requireAuth, bookRatingsController.create);

module.exports = router;