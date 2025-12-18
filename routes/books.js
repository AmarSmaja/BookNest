const router = require("express").Router();
const booksController = require("../controllers/BooksController");

router.get("/:id", booksController.detail);

module.exports = router;