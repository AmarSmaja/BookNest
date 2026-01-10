const adminStatsDao = require("../dao/AdminStatsDao");

class AdminStatsService {
    async getStats() {
        return adminStatsDao.getStats();
    }
}

module.exports = new AdminStatsService();