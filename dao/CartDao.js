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

        const bookIds = items.map(i => i.bookId);
        const books = bookIds.length ? await db.Book.findAll({ where: { id: bookIds } }) : [];

        const map = new Map(books.map(b => [b.id, b]));
        const rows = items.map(i => ({
            id: i.id,
            kolicina: i.kolicina,
            bookId: i.bookId,
            book: map.get(i.bookId) || null,
        }));

        return { cart, items: rows };
    }
}

module.exports = new CartDao();