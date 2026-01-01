const router = require("express").Router();
const adminSellersController = require("../controllers/AdminSellersController");
const { requireAuth } = require("../middlewares/auth");

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) return res.status(401).send("Nisi logovan!");
    if (req.session.user.role != "Admin") return res.status(403).send("Nemate pristup!");
    return next();
}

router.get("/seller-requests", requireAuth, adminSellersController.list);
router.post("/seller-requests/:userId/approve", requireAuth, adminSellersController.approve);
router.post("/seller-requests/:userId/reject", requireAuth, adminSellersController.reject);

module.exports = router;