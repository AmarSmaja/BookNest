const db = require("../models");
const bookService = require("../services/BookService");
const bookCommentService = require("../services/BookCommentService");

class BooksController {
    async detail(req, res) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).send("Neispravan ID!");

        const knjiga = await bookService.getBookDetail(id);
        if (!knjiga) return res.status(404).send("Nije pronadjeno!");

        let vidljivo = true;
        if (knjiga.status !== "Aktivna") {
            vidljivo = false;

            if (req.session && req.session.user) {
                const u = req.session.user;

                if (u.role === "Admin") vidljivo = true;
                if (u.id === knjiga.prodavacId) vidljivo = true;

                if (!vidljivo) {
                    const orderItem = await db.OrderItem.findOne({
                        where: { bookId: knjiga.id },
                        include: [{ model: db.Order, required: true, where: { kupacId: u.id, status: "Zavrsena" } }],
                    });

                    if (orderItem) vidljivo = true;
                }
            }
        }

        if (!vidljivo) return res.status(403).send("Nemate pristup ovoj knjizi!");

        if (knjiga.status === "Arhivirana") {
            if (!req.session || !req.session.user || req.session.user.role !== "Admin") {
                return res.status(404).send("Nije pronadjeno!");
            }
        }

        let canBuy = false;
        let canExchange = false;
        let canReport = false;

        let currentUser = null;
        if (req.session && req.session.user) {
            currentUser = req.session.user;

            const nijeMoja = (currentUser.id !== knjiga.prodavacId);
            const aktivna = (knjiga.status === "Aktivna");
            const exchangeable = (knjiga.spremnaZaRazmjenu === true);

            if (nijeMoja && aktivna) {
                canBuy = true;
                if (exchangeable) {
                    canExchange = true;
                }
                canReport = true;
            }
        }

        let isAdmin = false;
        if (currentUser && currentUser.role === "Admin") {
            isAdmin = true;
        }

        const komentari = await bookCommentService.izlistajKnjigu(id);

        res.render("books/detail", {
            title: knjiga.naziv,
            knjiga,
            canBuy,
            canExchange,
            canReport,
            komentari,
            currentUser,
            isAdmin,
            error: null,
        });
    }
}

module.exports = new BooksController();