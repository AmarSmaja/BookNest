const db = require("../models");

class BookRatingDao {
    findByBuyerAndBook(kupacId, bookId) {
        return db.BookRating.findOne({ where: { kupacId, bookId } });
    }

    findByBuyerAndBook(buyerId, bookId, t) {
        const opts = { where: { kupacId: buyerId, bookId: bookId } };
        if (t) opts.transaction = t;

        return db.BookRating.findOne(opts);
    }

    create(data, t) {
        if (t) return db.BookRating.create(data, { transaction: t });
        return db.BookRating.create(data);
    }

    listForBook(bookId, limit) {
        let lim = 10;
        if (limit != null) {
            const n = Number(limit);
            if (Number.isFinite(n) && n > 0) {
                lim = n;
            }
        }

        return db.BookRating.findAll({
            where: { bookId: bookId },
            order: [["id", "DESC"]],
            limit: lim,
        });
    }

    async statsForBook(bookId) {
        const rows = await db.BookRating.findAll({
            where: { bookId: bookId },
            attributes: [
                [db.sequelize.fn("COUNT", db.sequelize.col("id")), "brojOcjena"],
                [db.sequelize.fn("AVG", db.sequelize.col("rating")), "prosjekOcjena"],
            ], raw: true,
        });

        let broj = 0;
        let prosjek = null;

        if (rows && rows.length > 0) {
            const r = rows[0];

            const b = Number(r.brojOcjena);
            if (Number.isFinite(b)) {
                broj = b;
            }

            if (r.prosjekOcjena != null) {
                const p = Number(r.prosjekOcjena);
                if (Number.isFinite(p)) {
                    prosjek = p;
                }
            }
        }

        return { brojOcjena: broj, prosjekOcjena: prosjek };
    }
}

module.exports = new BookRatingDao();