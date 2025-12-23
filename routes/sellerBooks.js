const router = require("express").Router();
const sellerBooksController = require("../controllers/SellerBooksController");
const sellerOrdersController = require("../controllers/SellerOrdersController");
const { requireRoles } = require("../middlewares/auth");


router.get("/books", requireRoles(["Prodavac", "Admin"]), sellerBooksController.list);
router.get("/books/new", requireRoles(["Prodavac", "Admin"]), sellerBooksController.showCreate);
router.post("/books", requireRoles(["Prodavac", "Admin"]), sellerBooksController.create);
router.get("/books/:id/edit", requireRoles(["Prodavac", "Admin"]), sellerBooksController.showEdit);
router.post("/books/:id", requireRoles(["Prodavac", "Admin"]), sellerBooksController.update);

router.get("/orders", requireRoles(["Prodavac", "Admin"]), sellerOrdersController.list);
router.get("/orders/:id", requireRoles(["Prodavac", "Admin"]), sellerOrdersController.detail);
router.post("/orders/:id/status", requireRoles(["Prodavac", "Admin"]), sellerOrdersController.changeStatus);


module.exports = router;