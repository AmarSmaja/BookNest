const db = require("../models");

class OrderDao {
    create(data, t) {
        if (t) return db.Order.create(data, { transaction: t });
        
        return db.Order.create(data);
    }

    createOrderItem(data, t) {
        if (t) return db.OrderItem.create(data, { transaction: t });
        
        return db.OrderItem.create(data);
    }

    listOrderItemBookIds(orderId, t) {
        const oid = Number(orderId);
        if (!Number.isFinite(oid)) return Promise.resolve([]);

        const opts = { where: { orderId: oid }, attributes: ["bookId"], raw: true };
        if (t) opts.transaction = t;

        return db.OrderItem.findAll(opts);
    }

    listByOrder(orderId, t) {
        const opts = {
            where: { orderId: orderId },
            order: [["id", "ASC"]],
            include: [{ model: db.Book, as: "knjiga", required: false }],
        };
        if (t) opts.transaction = t;
        
        return db.OrderItem.findAll(opts);
    }

    listBookIdsByOrder(orderId, t) {
        const opts = {
            where: { orderId: orderId },
            attributes: ["bookId"],
            raw: true,
        };
        if (t) opts.transaction = t;
        return db.OrderItem.findAll(opts);
    }

    listByBuyer(userId, t) {
        const opts = { where: { kupacId: userId }, order: [["id", "ASC"]] };
        if (t) opts.transaction = t;

        return db.Order.findAll(opts);
    }

    updateByIdForBuyer(orderId, buyerId, patch, t) {
        const opts = { where: { id: orderId, kupacId: buyerId } };
        if (t) opts.transaction = t;

        return db.Order.update(patch, opts);
    }

    async findForSeller(sellerId) {
        return db.Order.findAll({
            where: { prodavacId: sellerId },
            order: [["id", "ASC"]],
        });
    }

    async findOwnedById(orderId, sellerId) {
        return db.Order.findOne({
            where: { id: orderId, prodavacId: sellerId },
        });
    }

    findOwnedByBuyer(orderId, buyerId, t) {
        const opts = { where: { id: orderId, kupacId: buyerId } };
        if (t) opts.transaction = t;

        return db.Order.findOne(opts);
    }

    findOne(orderId, bookId, t) {
        const opts = { where: { orderId: orderId, bookId: bookId } };
        if (t) opts.transaction = t;

        return db.OrderItem.findOne(opts);
    } 

    findOneByOrderAndBook(orderId, bookId, t) {
        const opts = { where: { orderId, bookId } };
        if (t) opts.transaction = t;
        return db.OrderItem.findOne(opts);
    }

    async getOrderItemsWithBooks(orderId) {
        return db.OrderItem.findAll({
            where: { orderId },
            include: [{ model: db.Book, as: "knjiga", required: false }],
            order: [["id", "ASC"]],
        });
    }

    findFinishedByBuyerForBook(buyerId, bookId, t) {
        const opts = {
            where: { bookId },
            include: [{
                model: db.Order,
                required: true,
                where: { kupacId: buyerId, status: "Zavrsena" },
            }],
        };
        if (t) opts.transaction = t;
        return db.OrderItem.findOne(opts);
    }

    async getOrderBookIds(orderId, transaction) {
        const rows = await db.OrderItem.findAll({
            where: { orderId },
            attributes: ["bookId"],
            transaction,
        });

        const ids = rows.map(r => Number(r.bookId)).filter(Number.isFinite);

        return [...new Set(ids)];
    }

    async updateStatus(orderId, sellerId, status, transaction) {
        return db.Order.update(
            { status },
            { where: { id: orderId, prodavacId: sellerId }, transaction }
        );
    }

    async markCompleted(orderId, sellerId, transaction) {
        return db.Order.update(
            { zavrsenaAt: new Date() },
            { where: { id: orderId, prodavacId: sellerId }, transaction }
        );
    }
}

module.exports = new OrderDao();