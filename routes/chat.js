const router = require("express").Router();
const chatController = require("../controllers/ChatController");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, chatController.list);
router.get("/start", requireAuth, chatController.startFromBook);
router.get("/start/:userId", requireAuth, chatController.start);
router.get("/:id", requireAuth, chatController.detail);
router.post("/:id/send", requireAuth, chatController.send);
router.post("/:id/message", requireAuth, chatController.send.bind(chatController));

module.exports = router;