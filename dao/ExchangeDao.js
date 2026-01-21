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
        console.log("DAO findSellerList sellerId:", sellerId);
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

    findById(exchangeId) {
        return db.ExchangeRequest.findByPk(exchangeId);
    }

    async getDetail(exchangeId, t) {
        const include = [
            { model: db.ExchangeRequestedBook, as: "requested", include: [{ model: db.Book, as: "book", required: false }] },
            { model: db.ExchangeOfferedBook, as: "offered", include: [{ model: db.Book, as: "book", required: false }] },
        ];

        return db.ExchangeRequest.findByPk(exchangeId, { include: include, transaction: t, });
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

    listRequestedBookIds(exchangeId, t) {
        const opts = {
            where: { exchangeId: exchangeId },
            attributes: ["bookId"],
            raw: true,
        };
        if (t) opts.transaction = t;

        return db.ExchangeRequestedBook.findAll(opts);
    }

    listOfferedBooks(exchangeId, t) {
        const opts = {
            where: { exchangeId: exchangeId },
            attributes: ["bookId"],
            raw: true,
        };
        if (t) opts.transaction = t;

        return db.ExchangeOfferedBook.findAll(opts);
    }

    async getAllBookIds(exchangeId, t) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) return [];

        const reqOpts = { where: { exchangeId: id }, attributes: ["bookId"], raw: true };
        if (t) reqOpts.transaction = t;

        const offOpts = { where: { exchangeId: id }, attributes: ["bookId"], raw: true };
        if (t) offOpts.transaction = t;

        const requestedRows = await db.ExchangeRequestedBook.findAll(reqOpts);
        const offeredRows = await db.ExchangeOfferedBook.findAll(offOpts);

        const ids = [];
        const seen = {};

        for (let i = 0; i < requestedRows.legth; i++) {
            const n = Number(requestedRows[i].bookId);
            if (Number.isFinite(n) && n > 0) {
                const k = String(n);
                if (!seen[k]) {
                    seen[k] = true;
                    ids.push(n);
                }
            }
        }

        for (let i = 0; i < offeredRows.length; i++) {
            const n = Number(offeredRows[i].bookId);
            if (Number.isFinite(n) && n > 0) {
                const k = String(n);
                if (!seen[k]) {
                    seen[k] = true;
                    ids.push(n);
                }
            }
        }

        return ids;
    }
}

module.exports = new ExchangeDao();