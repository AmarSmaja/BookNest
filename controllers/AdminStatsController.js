const adminStatsService = require("../services/AdminStatsService");

class AdminStatsController {
    async index(req, res) {
        const stats = await adminStatsService.getStats();

        return res.render("admin/stats", {
            title: "Admin statistike",
            stats: stats,
            error: null,
        });
    }
}

module.exports = new AdminStatsController();