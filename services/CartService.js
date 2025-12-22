const cartDao = require("../dao/CartDao");
const db = require("../models");

class CartService {
    async addToCart(user, { bookId }) {
        const id = Number(bookId);
        if (!Number.isFinite(id) || id <= 0) throw new Error("Neispravna knjiga!");

        const knjiga = await db.Book.findByPk(id);
        if (!knjiga) throw new Error("Knjiga ne postoji");

        if (knjiga.status !== "Aktivna") throw new Error("Knjiga nije dostupna!");
        if (knjiga.prodavacId === user.id) throw new Error("Ne mozes kupiti svoju knjigu!");

        await cartDao.addItem(user.id, id, 1);
    }

    async viewCart(user) {
        const { items } = await cartDao.getCartView(user.id);

        const safe = items.filter(r => r.book);
        let ukupno = 0;
        
        for (const r of safe) {
            ukupno += Number(r.book.cijena) * Number(r.kolicina);
        }

        return { items: safe, ukupno };
    }

    async removeItem(user, cartItemId) {
        const id = Number(cartItemId);
        if (!Number.isFinite(id) || id <= 0) return;
        await cartDao.removeItem(user.id, id);
    }
}

module.exports = new CartService();