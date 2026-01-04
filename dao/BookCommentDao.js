const db = require("../models");

class BookCommentDao {
    findByBuyerOrderBook(kupacId, orderId, bookId) {
        return db.BookComment.findOne({
            where: {
                kupacId: kupacId,
                orderId: orderId,
                bookId: bookId,
                obrisanAt: null,
            },
        });
    }

    create(data, t) {
        if (t) return db.BookComment.create(data, { transaction: t });
        return db.BookComment.create(data);
    }

    listForBook(bookId) {
        return db.BookComment.findAll({
            where: { bookId: bookId, obrisanAt: null },
            order: [["id", "DESC"]],
            include: [{
                model: db.User, as: "kupac", attributes: ["id", "ime", "prezime", "email"]
            },], 
        });
    }

    findById(id, t) {
        const opt = {};
        if (t) {
            opt.transaction = t;
        }

        return db.BookComment.findByPk(id, opt);
    }

    markDeleted(id, t) {
        const opt = { where: { id: id } };
        if (t) {
            opt.transaction = t;
        }

        return db.BookComment.update(
            { obrisanAt: new Date() }, opt
        );
    }
}

module.exports = new BookCommentDao();