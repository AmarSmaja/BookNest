const db = require("../models");

class AdminDashboardService {
    async getOverview() {
        const pendingSeller = await db.SellerProfile.count({ where: { status: "PENDING" }, });
        
        const openReports = await db.Report.count({ where: { status: ["Otvoren", "U_obradi"] }});

        const totalUsers = await db.User.count();
        const totalBooks = await db.Book.count();

        return {
            pendingSeller: pendingSeller,
            openReports: openReports,
            totalUsers: totalUsers,
            totalBooks: totalBooks,
        };
    }
}

module.exports = new AdminDashboardService();