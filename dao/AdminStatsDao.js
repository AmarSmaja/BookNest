const db = require("../models");
const { Op } = require("sequelize");

class AdminStatsDao {
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