const catalogService = require("../services/CatalogService");

class CatalogController {
    async index(req, res) {
        const data = await catalogService.getCatalogPage(req.query || {});
        return res.render("catalog/index", { title: data.title, knjige: data.knjige, filters: data.filters, genres: data.genres, languages: data.languages, conditions: data.conditions, error: null });
    }
}

module.exports = new CatalogController();