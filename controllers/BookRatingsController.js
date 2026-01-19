const bookRatingService = require("../services/BookRatingService");

class BookRatingsController {
    async showNew(req, res) {
        try {
            const data = await bookRatingService.getNewRatingData(req.query.orderId, req.query.bookId);
            return res.render("ratings/new", { title: "Ocjeni knjigu", orderId: data.orderId, bookId: data.bookId, knjiga: data.knjiga, error: null });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async create(req, res) {
        let orderId = null;
        let bookId = null;
        let ocjena = null;

        if (req.body) {
            if (req.body.orderId != null && String(req.body.orderId).trim() !== "") {
                const x = Number(req.body.orderId);
                if (Number.isFinite(x)) orderId = x;
            }

            if (req.body.bookId != null && String(req.body.bookId).trim() !== "") {
                const y = Number(req.body.bookId);
                if (Number.isFinite(y)) bookId = y;
            }

            if (req.body.ocjena != null) ocjena = req.body.ocjena;
        }

        try {
            await bookRatingService.ostaviOcjenuZaNarudzbu(req.session.user, orderId, bookId, ocjena);
            return res.redirect("/orders/" + orderId);
        } catch (e) {
            const knjiga = await bookRatingService.getBookOrNull(bookId);
            return res.status(400).render("ratings/new", { title: "Ocijeni knjigu", orderId, bookId, knjiga, error: e.message });
        }
    }
}

module.exports = new BookRatingsController();