const adminStatsDao = require("../dao/AdminStatsDao");

class AdminDashboardService {
    async getOverview() {
        const pendingSeller = await adminStatsDao.countPendingSellerProfiles();
        const openReports = await adminStatsDao.countOpenReports();
        const totalUsers = await adminStatsDao.countUsers();
        const totalBooks = await adminStatsDao.countBooks();

        return { pendingSeller: pendingSeller, openReports: openReports, totalUsers: totalUsers, totalBooks: totalBooks };
    }
}

module.exports = new AdminDashboardService();