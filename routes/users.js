var express = require('express');
var router = express.Router();

const profileController = require("../controllers/ProfileController");
const { requireAuth } = require("../middlewares/auth");
const usersController = require("../controllers/UsersController");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/interests", requireAuth, profileController.showInterests.bind(profileController));
router.post("/interests", requireAuth, profileController.saveInterests.bind(profileController));

router.get("/me", requireAuth, usersController.me);
router.get("/me/edit", requireAuth, usersController.editMe);
router.post("/me/edit", requireAuth, usersController.updateMe);
router.post("/me/password", requireAuth, usersController.changePassword);

router.get("/:id", usersController.publicProfile);

module.exports = router;
