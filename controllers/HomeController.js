const bookService = require("../services/BookService");

class HomeController {
    async index(req, res) {
        const knjige = await bookService.getHomeBooks();
        res.render("index", { title: "BookNest", knjige });
    }
}

module.exports = new HomeController();