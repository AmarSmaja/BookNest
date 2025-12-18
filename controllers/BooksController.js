const bookService = require("../services/BookService");

class BooksController {
    async detail(req, res) {
        const knjiga = await bookService.getBookDetail(req.params.id);
        if (!knjiga) return res.status(404).render("errors/404", { title: "Nije pronadjena knjiga." });

        res.render("books/detail", { title: knjiga.naziv, knjiga });
    }
}

module.exports = new BooksController();