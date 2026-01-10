const bookService = require("../services/BookService");
const popularBooksService = require("../services/PopularBooksService");

class HomeController {
    async index(req, res) {
        let knjige = await bookService.getRandomHomeBooks(12);

        let popular = [];
        let recommended = [];

        res.render("index", { title: "BookNest", knjige: knjige, popular: popular, recommended: recommended });
    }
}

module.exports = new HomeController();