var express = require('express');
var router = express.Router();

const profileController = require("../controllers/ProfileController");
const { requireAuth } = require("../middlewares/auth");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/interests", requireAuth, profileController.showInterests.bind(profileController));
router.post("/interests", requireAuth, profileController.saveInterests.bind(profileController));

module.exports = router;
