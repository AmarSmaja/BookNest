const db = require("../models");
const bookCommentService = require("../services/BookCommentService");

class BookCommentsController {
    async showNew(req, res) {
        const orderId = Number(req.query.orderId);
        const bookId = Number(req.query.bookId);

        if (!Number.isFinite(orderId)) return res.status(400).send("Neispravan orderId!");
        if (!Number.isFinite(bookId)) return res.status(400).send("Neispravan bookId!");

        let knjiga = null;
        knjiga = await db.Book.findByPk(bookId);

        return res.render("comments/new", { title: "Komentarisi knjigu", orderId: orderId, bookId: bookId, knjiga: knjiga, error: null });
    }

    async create(req, res) {
        const orderId = Number(req.body.orderId);
        const bookId = Number(req.body.bookId);

        try {
            await bookCommentService.ostaviKomentarZaNarudzbu(req.session.user, orderId, bookId, req.body.sadrzaj);
            return res.redirect("/orders/" + orderId);
        } catch (e) {
            let knjiga = null;
            if (Number.isFinite(bookId)) {
                knjiga = await db.Book.findByPk(bookId);
            }

            return res.status(400).render("comments/new", { title: "Komentarisi knjigu", orderId: orderId, bookId: bookId, knjiga: knjiga, error: e.message });
        }
    }

    async remove(req, res) {
        const commentId = Number(req.params.id);

        let returnTo = null;
        if (req.body && req.body.returnTo != null) {
            returnTo = String(req.body.returnTo).trim();
        }

        const orderId = Number(req.body.orderId);
        const bookId = Number(req.body.bookId);

        try {
            await bookCommentService.obrisiKomentar(req.session.user, commentId);

            if (returnTo === "book") {
                if (Number.isFinite(bookId)) {
                    return res.redirect("/books/" + bookId);
                }
            }

            if (Number.isFinite(orderId)) {
                return res.redirect("/orders/" + orderId);
            }

            return res.redirect("/");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new BookCommentsController();