const db = require("../models");

class ExchangeDao {
    createRequest(data, t) {
        return db.ExchangeRequest.create(data, { transaction: t });
    }

    async addOffered(exchangeId, bookIds, t) {
        const rows = bookIds.map((id) => ({ exchangeId, bookId: id }));
        if (!rows.length) return;
        await db.ExchangeOfferedBook.bulkCreate(rows, { transaction: t });
    }

    async addRequested(exchangeId, bookIds, t) {
        const rows = bookIds.map((id) => ({ exchangeId, bookId: id }));
        if (!rows.length) return;
        await db.ExchangeRequestedBook.bulkCreate(rows, { transaction: t });
    }

    findBuyerList(buyerId) {
        return db.ExchangeRequest.findAll({
            where: { kupacId: buyerId },
            order: [["id", "ASC"]],
        });
    }

    findSellerList(sellerId) {
        return db.ExchangeRequest.findAll({
            where: { prodavacId: sellerId },
            order: [["id", "ASC"]],
        });
    }

    findOwnedByBuyer(exchangeId, buyerId) {
        return db.ExchangeRequest.findOne({ where: { id: exchangeId, kupacId: buyerId } });
    }

    findOwnedBySeller(exchangeId, sellerId) {
        return db.ExchangeRequest.findOne({ where: { id: exchangeId, prodavacId: sellerId } });
    }

    async getDetail(exchangeId, t) {
        const sadrzi = [
            { model: db.ExchangeRequestedBook, as: "requested", include: [{ model: db.Book, as: "book", required: false }] },
            { model: db.ExchangeOfferedBook, as: "offered", include: [{ model: db.Book, as: "book", required: false }] },
        ];

        return db.ExchangeRequest.findByPk(exchangeId, { sadrzi, transaction: t, });
    }

    updateStatus(exchangeId, status, t) {
        return db.ExchangeRequest.update(
            { status },
            { where: { id: exchangeId }, transaction: t }
        );
    }

    oznaciZavrseno(exchangeId, t) {
        return db.ExchangeRequest.update(
            { zavrsenaAt: new Date() },
            { where: { id: exchangeId }, transaction: t }
        );
    }
}

module.exports = new ExchangeDao();