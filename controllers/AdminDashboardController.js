const adminDashboardService = require("../services/AdminDashboardService");

class AdminDashboardController {
    async index(req, res) {
        const data = await adminDashboardService.getOverview();
        return res.render("admin/index", { title: "Admin panel", overview: data, error: null });
    }
}

module.exports = new AdminDashboardController();