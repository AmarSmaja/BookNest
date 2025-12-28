const bookService = require("../services/BookService");

class BooksController {
    async detail(req, res) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).send("Neispravan ID!");

        const knjiga = await bookService.getBookDetail(id);
        if (!knjiga) return res.status(404).send("Nije pronadjeno!");

        let canBuy = false;
        let canExchange = false;

        if (req.session && req.session.user) {
            const u = req.session.user;

            const nijeMoja = (u.id !== knjiga.prodavacId);
            const aktivna = (knjiga.status === "Aktivna");
            const exchangeable = (knjiga.is_exchangeable === true);

            if (nijeMoja && aktivna) {
                canBuy = true;
                if (exchangeable) {
                    canExchange = true;
                }
            }
        }

        res.render("books/detail", {
            title: knjiga.naziv,
            knjiga,
            canBuy,
            canExchange,
            error: null,
        });
    }
}

module.exports = new BooksController();