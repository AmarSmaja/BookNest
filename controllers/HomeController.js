const bookService = require("../services/BookService");
const popularBooksService = require("../services/PopularBooksService");

class HomeController {
    async index(req, res) {
    let knjige = await bookService.getRandomHomeBooks(12);
    let popular = await bookService.getPopularBooks(6);

    let recommended = [];
    if (req.session && req.session.user && req.session.user.id) {
        recommended = await bookService.getRecommendedBooksForUser(req.session.user.id, 6);
    }

    res.render("index", { title: "BookNest", knjige: knjige, popular: popular, recommended: recommended });
}
}

module.exports = new HomeController();