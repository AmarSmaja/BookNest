const db = require("../models");
const bookService = require("../services/BookService");
const bookCommentService = require("../services/BookCommentService");
const BookRatingService = require("../services/BookRatingService");

class BooksController {
    async detail(req, res) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).send("Neispravan ID!");

        const knjiga = await bookService.getBookDetail(id);
        if (!knjiga) return res.status(404).send("Nije pronadjeno!");

        let currentUser = null;
        if (req.session && req.session.user) {
            currentUser = req.session.user;
        }

        let vidljivo = true;
        if (knjiga.status !== "Aktivna") {
            vidljivo = false;

            if (currentUser) {
                if (currentUser === "Admin") vidljivo = true;
                if (currentUser.id === knjiga.prodavacId) vidljivo = true;

                if (!vidljivo) {
                    const orderItem = await db.OrderItem.findOne({
                        where: { bookId: knjiga.id },
                        include: [{
                            model: db.Order,
                            required: true,
                            where: { kupacId: currentUser.id, status: "Zavrsena" },
                        }],
                    });

                    if (orderItem) vidljivo = true;
                }
            }
        }

        if (!vidljivo) return res.status(403).send("Nemate pristup ovoj knjizi!");

        if (knjiga.status === "Arhivirana") {
            if (!currentUser || currentUser.role !== "Admin") {
                return res.status(404).send("Nije pronadjeno!");
            }
        }

        let canBuy = false;
        let canExchange = false;
        let canReport = false;
        let canChat = false;

        if (currentUser) {
            const nijeMoja = (currentUser.id !== knjiga.prodavacId);
            const aktivna = (knjiga.status === "Aktivna");
            const exchangeable = (knjiga.spremnaZaRazmjenu === true);

            if (nijeMoja && aktivna) {
                canBuy = true;
                canReport = true;
                canChat = true;

                if (exchangeable) {
                    canExchange = true;
                }
            }

            // if (nijeMoja) {
            //     canChat = true;
            // }
        }

        let isAdmin = false;
        if (currentUser && currentUser.role === "Admin") {
            isAdmin = true;
        }

        let lastOrderIdForRating = null;

        const komentari = await bookCommentService.izlistajKnjigu(id);
        const ratingStats = await BookRatingService.getStatsZaKnjigu(id);
        const ratings = await BookRatingService.listajZaKnjigu(id, 10);

        res.render("books/detail", {
            title: knjiga.naziv,
            knjiga,
            canBuy,
            canExchange,
            canReport,
            komentari,
            currentUser,
            isAdmin,
            canChat,
            ratingStats,
            ratings,
            lastOrderIdForRating,
            error: null,
        });
    }
}

module.exports = new BooksController();