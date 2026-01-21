const cartDao = require("../dao/CartDao");

class CartService {
    async addToCart(user, body) {
        if (!user || !user.id) throw new Error("Niste prijavljeni.");

        const bookId = Number(body?.bookId);
        if (!Number.isFinite(bookId) || bookId <= 0) throw new Error("Neispravan bookId!");

        const qty = body?.kolicina != null ? Number(body.kolicina) : 1;
        const kolicina = Number.isFinite(qty) && qty > 0 ? qty : 1;

        return cartDao.addItem(user.id, bookId, kolicina);
    }

    async viewCart(user) {
        if (!user || !user.id) throw new Error("Niste prijavljeni.");

        const data = await cartDao.getCartView(user.id);
        const items = data && Array.isArray(data.items) ? data.items : [];

        let ukupno = 0;
        for (const it of items) {
        const cijena = Number(it?.book?.cijena ?? 0);
        const kolicina = Number(it?.kolicina ?? 0);
        ukupno += cijena * kolicina;
        }

        return { items, ukupno };
    }

    async removeItem(user, cartItemId) {
        if (!user || !user.id) throw new Error("Niste prijavljeni.");

        const id = Number(cartItemId);
        if (!Number.isFinite(id) || id <= 0) throw new Error("Neispravan cartItemId.");

        return cartDao.removeItem(user.id, id);
    }
}

module.exports = new CartService();