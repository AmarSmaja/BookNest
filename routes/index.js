var express = require('express');
var router = express.Router();

const homeController = require("../controllers/HomeController");
const catalogController = require("../controllers/CatalogController");

router.get("/", homeController.index);
router.get("/catalog", catalogController.index);

module.exports = router;
