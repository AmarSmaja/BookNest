const bookCommentService = require("../services/BookCommentService");

class BookCommentsController {
    async showNew(req, res) {
        try {
            const data = await bookCommentService.uzmiNovePodatkeKomentara(req.query.orderId, req.query.bookId);
            return res.render("comments/new", { title: "Komentarisi knjigu", orderId: data.orderId, bookId: data.bookId, knjiga: data.knjiga, error: null });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async create(req, res) {
        const orderId = Number(req.body.orderId);
        const bookId = Number(req.body.bookId);

        try {
            await bookCommentService.ostaviKomentarZaNarudzbu(req.session.user, orderId, bookId, req.body.sadrzaj);
            return res.redirect("/orders/" + orderId);
        } catch (e) {
            const knjiga = await bookCommentService.getBookOrNull(bookId);
            return res.status(400).render("comments/new", { title: "Komentarisi knjigu", orderId: orderId, bookId: bookId, knjiga: knjiga, error: e.message });
        }
    }

    async remove(req, res) {
        const commentId = Number(req.params.id);

        let returnTo = null;
        if (req.body && req.body.returnTo != null) returnTo = String(req.body.returnTo).trim();

        const orderId = Number(req.body.orderId);
        const bookId = Number(req.body.bookId);

        try {
            await bookCommentService.obrisiKomentar(req.session.user, commentId);

            if (returnTo === "book" && Number.isFinite(bookId)) return res.redirect("/books/" + bookId);
            if (Number.isFinite(orderId)) return res.redirect("/orders/" + orderId);

            return res.redirect("/");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new BookCommentsController();