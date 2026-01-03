const db = require("../models");

class BookRatingDao {
    findByBuyerAndBook(kupacId, bookId) {
        return db.BookRating.findOne({ where: { kupacId, bookId } });
    }

    create(data, t) {
        if (t) return db.BookRating.create(data, { transaction: t });
        return db.BookRating.create(data);
    }

    listForBook(bookId) {
        return db.BookRating.findAll({
            where: { bookId },
            order: [["id", "DESC"]],
        });
    }
}

module.exports = new BookRatingDao();