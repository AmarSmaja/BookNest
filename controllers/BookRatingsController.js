const db = require("../models");
const bookRatingService = require("../services/BookRatingService");

class BookRatingsController {
    async showNew(req, res) {
        const orderId = Number(req.query.orderId);
        const bookId = Number(req.query.bookId);

        if (!Number.isFinite(orderId)) throw new Error("Neispravan ID narudzbe!");
        if (!Number.isFinite(bookId)) throw new Error("Neispravan ID knjige!");

        const knjiga = await db.Book.findByPk(bookId);
        if (!knjiga) return res.status(404).send("Knjiga nije pronadjena!");

        const item = await db.OrderItem.findOne({ where: { orderId, bookId: bookId } });
        if (!item) return res.status(400).send("Ova knjiga nije u toj narudzbi!");

        return res.render("ratings/new", { title: "Ocijeni knjigu", orderId: orderId, bookId: bookId, knjiga: knjiga, error: null });
    }

    async create(req, res) {
        let orderId = null;
        let bookId = null;
        let ocjena = null;

        if (req.body) {
            if (req.body.orderId != null && String(req.body.orderId).trim() !== "") {
                const x = Number(req.body.orderId);
                if (Number.isFinite) {
                    orderId = x;
                }
            }

            if (req.body.bookId != null && String(req.body.bookId).trim() !== "") {
                const y = Number(req.body.bookId);
                if (Number.isFinite(y)) {
                    bookId = y;
                }
            }

            if (req.body.ocjena != null) {
                ocjena = req.body.ocjena;
            }
        }

        try {
            await bookRatingService.ostaviOcjenuZaNarudzbu(req.session.user, orderId, bookId, ocjena);
            return res.redirect("/orders/" + orderId);
        } catch (e) {
            let knjiga = null;
            if (bookId != null) {
                knjiga = await db.Book.findByPk(bookId);
            }

            return res.status(400).render("ratings/new", { title: "Ocijeni knjigu", orderId: orderId, bookId: bookId, knjiga: knjiga, error: e.message, });
        }
    }
}

module.exports = new BookRatingsController();