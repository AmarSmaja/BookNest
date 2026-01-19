const bookService = require("../services/BookService");
const bookCommentService = require("../services/BookCommentService");
const BookRatingService = require("../services/BookRatingService");
const popularBooksService = require("../services/PopularBooksService");
const bookAccessService = require("../services/BookAccessService");

class BooksController {
    async detail(req, res) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).send("Neispravan ID!");

        const knjiga = await bookService.getBookDetail(id);
        if (!knjiga) return res.status(404).send("Nije pronadjeno!");

        const currentUser = req.session?.user || null;
        const access = await bookAccessService.computeAccess(currentUser, knjiga);

        if (access.izbaci404) return res.status(404).send("Nije pronadjeno!");
        if (!access.vidljivo) return res.status(403).send("Nemate pristup toj knjizi!");

        const komentari = await bookCommentService.izlistajKnjigu(id);
        const ratingStats = await BookRatingService.getStatsZaKnjigu(id);
        const ratings = await BookRatingService.listajZaKnjigu(id, 10);

        return res.render("books/detail", { 
            title: knjiga.naziv, knjiga, 
            canBuy: access.canBuy, 
            canExchange: access.canExchange, 
            canReport: access.canReport, 
            canChat: access.canChat, 
            komentari,
            currentUser,
            isAdmin: access.isAdmin,
            ratingStats,
            ratings,
            lastOrderIdForRating: null,
            error: null,
        });
    }

    async popular(req, res) {
        let limit = 10;
        if (req.query?.limit != null) {
            const n = Number(req.query.limit);
            if (Number.isFinite(n) && n > 0) limit = n;
        }

        const books = await popularBooksService.listPopular(limit);
        return res.render("books/popular", { title: "Najpopularnije knjige", books, error: null });
    }
}

module.exports = new BooksController();