const lookupDao = require("../dao/LookupDao");
const bookService = require("../services/BookService");

class CatalogController {
    async index(req, res) {
        var q = "";
        var genreId = "";
        var languageId = "";
        var conditionId = "";
        var exchangeable = "";
        var minPrice = "";
        var maxPrice = "";
        var sort = "newest";

        if (req.query && req.query.q !== undefined && req.query.q !== null) q = String(req.query.q);
        if (req.query && req.query.genreId !== undefined && req.query.genreId !== null) genreId = String(req.query.genreId);
        if (req.query && req.query.languageId !== undefined && req.query.languageId !== null) languageId = String(req.query.languageId);
        if (req.query && req.query.conditionId !== undefined && req.query.conditionId !== null) conditionId = String(req.query.conditionId);
        if (req.query && req.query.exchangeable !== undefined && req.query.exchangeable !== null) exchangeable = String(req.query.exchangeable);
        if (req.query && req.query.minPrice !== undefined && req.query.minPrice !== null) minPrice = String(req.query.minPrice);
        if (req.query && req.query.maxPrice !== undefined && req.query.maxPrice !== null) maxPrice = String(req.query.maxPrice);
        if (req.query && req.query.sort !== undefined && req.query.sort !== null) sort = String(req.query.sort);

        // pagination (opcioni)
        var page = 1;
        if (req.query && req.query.page !== undefined && req.query.page !== null) {
            page = Number(req.query.page);
            if (!Number.isFinite(page) || page <= 0) page = 1;
        }

        var limit = 24;
        var offset = (page - 1) * limit;

        const lookups = await lookupDao.getBookFormLookups();

        const filters = {
            q: q,
            genreId: genreId,
            languageId: languageId,
            conditionId: conditionId,
            exchangeable: exchangeable,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sort: sort,
            limit: limit,
            offset: offset,
            page: page,
        };

        const knjige = await bookService.searchCatalog(filters);

        res.render("catalog/index", {
            title: "Katalog",
            knjige: knjige,
            filters: filters,
            genres: lookups.genres,
            languages: lookups.languages,
            conditions: lookups.conditions,
            error: null,
        });
    }
}

module.exports = new CatalogController();