const router = require("express").Router();
const booksController = require("../controllers/BooksController");

router.get("/popular", booksController.popular);
router.get("/:id", booksController.detail);

module.exports = router;