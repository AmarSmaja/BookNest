const router = require("express").Router();
const sellerBooksController = require("../controllers/SellerBooksController");
const { requireRoles } = require("../middlewares/auth");

router.get("/books", requireRoles(["Prodavac", "Admin"]), sellerBooksController.list);
router.get("/books/new", requireRoles(["Prodavac", "Admin"]), sellerBooksController.showCreate);
router.post("/books", requireRoles(["Prodavac", "Admin"]), sellerBooksController.create);

module.exports = router;