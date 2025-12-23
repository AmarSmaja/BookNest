const db = require("../models");

class OrderDao {
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

    async getOrderItemsWithBooks(orderId) {
        const items = await db.OrderItem.findAll({
            where: { orderId },
            order: [["id", "ASC"]],
        });

        const bookIds = items.map(i => i.bookId);
        const knjige = bookIds.length ? await db.Book.findAll({ where: { id: bookIds } }) : [];

        const map = new Map(knjige.map(b => [b.id, b]));
        const rows = items.map(i => ({
            id: i.id,
            cijenaUTrenutku: i.cijenaUTrenutku,
            bookId: i.bookId,
            book: map.get(i.bookId) || null,
        }));

        return rows;
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