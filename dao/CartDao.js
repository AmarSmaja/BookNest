const db = require("../models");

class CartDao {
    async getOrCreateCart(kupacId) {
        let cart = await db.Cart.findOne({ where: { kupacId } });
        if (!cart) cart = await db.Cart.create({ kupacId });
        return cart;
    }

    async addItem(kupacId, bookId, qty = 1) {
        const cart = await this.getOrCreateCart(kupacId);

        const postoji = await db.CartItem.findOne({ where: { cartId: cart.id, bookId } });

        if (postoji) {
            await postoji.update({ kolicina: postoji.kolicina + qty });
            return postoji;
        }

        return db.CartItem.create({
            cartId: cart.id,
            bookId,
            kolicina: qty,
        });
    }

    async removeItem(kupacId, cartItemId) {
        const cart = await this.getOrCreateCart(kupacId);
        return db.CartItem.destroy({ where: { id: cartItemId, cartId: cart.id } });
    }

    async clearCart(kupacId, transaction) {
        const cart = await this.getOrCreateCart(kupacId);
        return db.CartItem.destroy({ where: { cartId: cart.id }, transaction });
    }

    async getCartView(kupacId) {
        const cart = await this.getOrCreateCart(kupacId);

        const items = await db.CartItem.findAll({
            where: { cartId: cart.id },
            order: [["id", "ASC"]],
        });

        var bookIds = [];
        for (let i = 0; i < items.length; i++) {
            bookIds.push(items[i].bookId);
        }

        var books = [];
        if (bookIds.length > 0) {
            books = await db.Book.findAll({ where: { id: bookIds } });
        }

        var lookup = {};
        for (var j = 0; j < books.length; j++) {
            lookup[books[j].id] = books[j];
        }

        var rows = [];
        for (var k = 0; k < items.length; k++) {
            var it = items[k];

            rows.push({
                id: it.id,
                kolicina: it.kolicina,
                bookId: it.bookId,
                book: lookup[it.bookId] ? lookup[it.bookId] : null,
            });
        }

        return { cart: cart, items: rows };
    }
}

module.exports = new CartDao();