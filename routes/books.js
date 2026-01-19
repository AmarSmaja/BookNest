const router = require("express").Router();
const booksController = require("../controllers/BooksController");
const { requireAuth } = require("../middlewares/auth");

router.get("/popular", requireAuth, booksController.popular);
router.get("/:id", booksController.detail);

module.exports = router;