const db = require("../models");
const { Op } = require("sequelize");

class AdminStatsDao {
    countPendingSellerProfiles() {
        return db.SellerProfile.count({ where: { status: "PENDING" } });
    }

    countOpenReports() {
        return db.Report.count({ where: { status: ["Otvoren", "U_obradi"] } });
    }

    countUsers() {
        return db.User.count();
    }

    countBooks() {
        return db.Book.count();
    }

    listOpen() {
        return db.Report.findAll({ where: { status: ["Otvoren", "U_obradi"] }, order: [["id", "DESC"]] });
    }

    findById(reportId, t) {
        const opts = {};
        if (t) opts.transaction = t;

        return db.Report.findByPk(reportId, opts);
    }

    listAdminIds(t) {
        const opts = { where: { role: "Admin" }, attributes: ["id"], raw: true };
        if (t) opts.transaction = t;

        return db.User.findAll(opts);
    }

    updateStatusAndResolver(reportId, status, rijesioAdminId, t) {
        const opts = { where: { id: reportId } };
        if (t) opts.transaction = t;

        return db.Report.update({ status: status, rijesioAdminId: rijesioAdminId }, opts);
    }

    updateBookStatus(bookId, status, t) {
        const opts = { where: { id: bookId } };
        if (t) opts.transaction = t;

        return db.Book.update({ status: status }, opts);
    }

    async getBooksByStatus() {
        const rows = await db.Book.findAll({
            attributes: [
                "status",
                [db.sequelize.fn("COUNT", db.sequelize.col("Book.id")), "count"],
            ],
            group: ["status"],
            order: [["status", "ASC"]],
            raw: true,
        });

        return rows;
    }

    async getOrdersByStatus() {
        const rows = await db.Order.findAll({
            attributes: [
                "status",
                [db.sequelize.fn("COUNT", db.sequelize.col("Order.id")), "count"],
            ],
            group: ["status"],
            order: [["status", "ASC"]],
            raw: true,
        });

        return rows;
    }

    async getTopGenresActiveOnStock(limit) {
        var lim = 10;
        if (limit !== undefined && limit !== null) {
            lim = Number(limit);
            if (!Number.isFinite(lim) || lim <= 0) lim = 10;
        }

        const rows = await db.Book.findAll({
            attributes: [
                [db.sequelize.col("Genre.naziv"), "label"],
                [db.sequelize.fn("COUNT", db.sequelize.col("Book.id")), "count"],
            ],
            include: [
                {
                    model: db.Genre,
                    attributes: [],
                    required: true,
                },
            ],
            where: {
                status: "Aktivna",
                kolicinaDostupno: { [Op.gt]: 0 },
            },
            group: [db.sequelize.col("Genre.naziv")],
            order: [[db.sequelize.literal("count"), "DESC"]],
            limit: lim,
            raw: true,
        });

        return rows;
    }

    async getStats() {
        const booksByStatus = await this.getBooksByStatus();
        const ordersByStatus = await this.getOrdersByStatus();
        const topGenres = await this.getTopGenresActiveOnStock(10);

        return {
            booksByStatus: booksByStatus,
            ordersByStatus: ordersByStatus,
            topGenres: topGenres,
        };
    }
}

module.exports = new AdminStatsDao();