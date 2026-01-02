const router = require("express").Router();
const adminDashboardController = require("../controllers/AdminDashboardController");
const { requireRole } = require("../middlewares/auth");
const adminUsersRouter = require("./admin");
const adminSellerRequestsRouter = require("./adminSellerRequests");
const reportsRouter = require("./reports");

router.use(requireRole("Admin"));
router.get("/", adminDashboardController.index);
router.use("/", adminUsersRouter);
router.use("/seller-requests", adminSellerRequestsRouter);
router.use("/reports", reportsRouter);

module.exports = router;