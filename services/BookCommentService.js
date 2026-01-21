const db = require("../models");
const bookCommentDao = require("../dao/BookCommentDao");
const notificationDao = require("../dao/NotificationDao");
const bookDao = require("../dao/BookDao");
const orderDao = require("../dao/OrderDao");

class BookCommentService {
    async ostaviKomentarZaNarudzbu(user, orderId, bookId, sadrzaj) {
        if (!user) throw new Error("Nisi logovan!");

        const oid = Number(orderId);
        if (!Number.isFinite(oid)) throw new Error("Neispravan ID narudzbe!");

        const bid = Number(bookId);
        if (!Number.isFinite(bid)) throw new Error("Neispravan ID knjige!");

        let tekst = "";
        if (sadrzaj != null) {
            tekst = String(sadrzaj).trim();
        }

        if (tekst.length === 0) throw new Error("Komentar ne smije biti prazan!");
        if (tekst.length > 2000) throw new Error("Komentar ne smije imati vise od 2000 karaktera!");
        
        return db.sequelize.transaction(async (t) => {
            const knjiga = await bookDao.findById(bid, t);
            if (!knjiga) throw new Error("Knjiga ne postoji!");
            if (Number(knjiga.prodavacId) === Number(user.id)) throw new Error("Ne mozes komentarisati svoju knjigu!");

            const narudzba = await orderDao.findOwnedByBuyer(oid, user.id, t);
            if (!narudzba) throw new Error("Narudzba nije pronadjena!");
            if (narudzba.status !== "Zavrsena") throw new Error("Komentar mozes ostaviti tek nakon zavrsene narudzbe!");

            const stavka = await orderDao.findOne(oid, bid, t);
            if (!stavka) throw new Error("Ova knjiga nije u toj narudzbi");

            const postoji = await bookCommentDao.findByBuyerOrderBook(user.id, oid, bid, t);
            if (postoji) throw new Error("Vec si ostavio komentar za ovu knjigu u ovoj narudzbi!");

            const komentar = await bookCommentDao.create({ bookId: bid, kupacId: user.id, orderId: oid, sadrzaj: tekst, uredjenAt: null, obrisanAt: null }, t);

            await notificationDao.create({ userId: knjiga.prodavacId, tip: "Novi_komentar_knjige", payloadJson: { bookId: bid, kupacId: user.id, orderId: oid, commentId: komentar.id } }, t);

            return komentar;
        })
    }

    async izlistajKnjigu(bookId) {
        const bid = Number(bookId);
        if (!Number.isFinite(bid)) return [];
        return bookCommentDao.listForBook(bid);
    }

    async obrisiKomentar(user, commentId) {
        if (!user) throw new Error("Nisi logovan!");

        const cid = Number(commentId);
        if (!Number.isFinite(cid)) throw new Error("Neispravan ID komentara!");

        return db.sequelize.transaction(async (t) => {
            const c = await bookCommentDao.findById(cid, t);
            if (!c) throw new Error("Komentar nije pronadjen!");
            if (c.obrisanAt) return true;

            if (user.role !== "Admin") {
                if (c.kupacId !== user.id) throw new Error("Nemate pravo obrisati ovaj komentar!");
            }

            await bookCommentDao.markDeleted(cid, t);
            return true;
        });
    }

    async uzmiNovePodatkeKomentara(orderIdRaw, bookIdRaw) {
        const orderId = Number(orderIdRaw);
        const bookId = Number(bookIdRaw);

        if (!Number.isFinite(orderId)) throw new Error("Neispravan orderId!");
        if (!Number.isFinite(bookId)) throw new Error("Neispravan bookId!");

        const knjiga = await bookDao.findById(bookId);
        if (!knjiga) throw new Error("Knjiga nije pronadjena!");

        return { orderId, bookId, knjiga };
    }

    async getBookOrNull(bookIdRaw) {
        const bookId = Number(bookIdRaw);
        if (!Number.isFinite(bookId)) return null;
        return bookDao.findById(bookId);
    }
}

module.exports = new BookCommentService();