const cartDao = require("../dao/CartDao");
const db = require("../models");

class CartService {
    async addToCart(user, { bookId }) {
        const id = Number(bookId);
        if (!Number.isFinite(id) || id <= 0) throw new Error("Neispravna knjiga!");

        const knjiga = await db.Book.findByPk(id);
        if (!knjiga) throw new Error("Knjiga ne postoji!");

        if (knjiga.status !== "Aktivna") throw new Error("Knjiga nije dostupna!");
        if (knjiga.prodavacId === user.id) throw new Error("Ne mozes kupiti svoju knjigu!");

        var stanje = Number(knjiga.kolicinaDostupno);
        if (!Number.isFinite(stanje)) stanje = 0;

        if (stanje <= 0) throw new Error("Knjiga nije na stanju!");

        const cart = await cartDao.getOrCreateCart(user.id);

        const postoji = await db.CartItem.findOne({ where: { cartId: cart.id, bookId: id } });

        let trenutnoUCartu = 0;
        if (postoji) {
            trenutnoUCartu = Number(postoji.kolicina);
            if (!Number.isFinite(trenutnoUCartu)) trenutnoUCartu = 0;
        }

        if (trenutnoUCartu >= stanje) throw new Error("Nema vise primjeraka na stanju za ovu knjigu!");

        await cartDao.addItem(user.id, id, 1);
    }

    async viewCart(user) {
        const rezultat = await cartDao.getCartView(user.id);
        const items = rezultat.items;

        let safe = [];
        let ukupno = 0;

        for (let i = 0; i < items.length; i++) {
            let r = items[i];
            if (r.book) {
                safe.push(r);
                ukupno += Number(r.book.cijena) * Number(r.kolicina);
            }
        }

        return { items: safe, ukupno: ukupno };
    }

    async removeItem(user, cartItemId) {
        const id = Number(cartItemId);
        if (!Number.isFinite(id) || id <= 0) return;
        await cartDao.removeItem(user.id, id);
    }
}

module.exports = new CartService();