var express = require('express');
var router = express.Router();

const homeController = require("../controllers/HomeController");
const catalogController = require("../controllers/CatalogController");
const adminLookupsRouter = require("./adminLookups");

router.get("/", homeController.index);
router.get("/catalog", catalogController.index);
router.use("/admin/lookups", adminLookupsRouter);

module.exports = router;
