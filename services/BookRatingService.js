const db = require("../models");
const bookRatingDao = require("../dao/BookRatingDao");
const notificationDao = require("../dao/NotificationDao");
const orderDao = require("../dao/OrderDao");
const bookDao = require("../dao/BookDao");

class BookRatingService {
    async ostaviOcjenuZaNarudzbu(user, orderId, bookId, ocjena) {
        if (!user) throw new Error("Nisi logovan!");

        const oid = Number(orderId);
        if (!Number.isFinite(oid)) throw new Error("Neispravan ID narudzbe!");

        const bid = Number(bookId);
        if (!Number.isFinite(bid)) throw new Error("Neispravan ID knjige!");

        const r = Number(ocjena);
        if (!Number.isFinite(r) || r < 1 || r > 5) throw new Error("Ocjena mora biti u rasponu od 1 do 5!");

        return db.sequelize.transaction(async (t) => {
            const knjiga = await bookDao.findById(bid, t);
            if (!knjiga) throw new Error("Knjiga ne postoji!");
            if (Number(knjiga.prodavacId) === Number(user.id)) throw new Error("Ne mozes ocijeniti svoju knjigu!");

            const narudzba = await orderDao.findOwnedByBuyer(oid, user.id, t);
            if (!narudzba) throw new Error("Narudzba nije pronadjena!");
            if (narudzba.status !== "Zavrsena") throw new Error("Mozes ocijeniti tek nakon zavrsene narudzbe");

            const stavka = await orderDao.findOneByOrderAndBook(oid, bid, t);
            if (!stavka) throw new Error("Ova knjiga nije u toj narudzbi!");

            const postoji = await bookRatingDao.findByBuyerAndBook(user.id, bid, t);
            if (postoji) throw new Error("Vec si ocijenio ovu knjigu!");

            const rating = await bookRatingDao.create({ bookId: bid, kupacId: user.id, orderId: oid, ocjena: r }, t);

            await notificationDao.create({ userId: knjiga.prodavacId, tip: "Nova_ocjena_knjige", payloadJson: { bookId: bid, kupacId: user.id, orderId: oid, ocjena: r, ratingId: rating.id } }, t);

            return rating;
        });
    }

    async getStatsZaKnjigu(bookId) {
        const bid = Number(bookId);
        if (!Number.isFinite(bid)) return { brojOcjena: 0, prosjekOcjena: null };

        return bookRatingDao.statsForBook(bid);
    }

    async listajZaKnjigu(bookId, limit) {
        const bid = Number(bookId);
        if (!Number.isFinite(bid)) return [];
        return bookRatingDao.listForBook(bid, limit);
    }

    async getNewRatingData(orderIdRaw, bookIdRaw) {
        const orderId = Number(orderIdRaw);
        const bookId = Number(bookIdRaw);

        if (!Number.isFinite(orderId)) throw new Error("Neispravan ID narudzbe!");
        if (!Number.isFinite(bookId)) throw new Error("Neispravan ID knjige!");

        const knjiga = await bookDao.findById(bookId);
        if (!knjiga) throw new Error("Knjiga nije pronadjena!");

        const item = await orderDao.findOneByOrderAndBook(orderId, bookId);
        if (!item) throw new Error("Ova knjiga nije u toj narudzbi!");

        return { orderId, bookId, knjiga };
    }

    async getBookOrNull(bookIdRaw) {
        const bookId = Number(bookIdRaw);
        if (!Number.isFinite(bookId)) return null;
        return bookDao.findById(bookId);
    }
}

module.exports = new BookRatingService();