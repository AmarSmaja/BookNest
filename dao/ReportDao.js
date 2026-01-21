const db = require("../models");

class ReportDao {
    create(data, t) {
        if (t) return db.Report.create(data, { transaction: t });
        return db.Report.create(data);
    }
}

module.exports = new ReportDao();