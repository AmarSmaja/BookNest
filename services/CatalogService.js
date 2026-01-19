const lookupDao = require("../dao/LookupDao");
const bookService = require("../services/BookService");

function str(q) {
    if (q === undefined || q === null) return "";
    return String(q);
}

function numStr(q) {
    return str(q).trim();
}

function parsePage(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return Math.floor(n);
}

class CatalogService {
    async getCatalogPage(query) {
        const q = str(query.q);
        const genreId = numStr(query.genreId);
        const languageId = numStr(query.languageId);
        const conditionId = numStr(query.conditionId);
        const exchangeable = str(query.exchangeable);
        const minPrice = numStr(query.minPrice);
        const maxPrice = numStr(query.maxPrice);
        const sort = query.sort != null ? String(query.sort) : "newest";

        const page = parsePage(query.page);
        const limit = 24;
        const offset = (page - 1) * limit;

        const lookups = await lookupDao.getBookFormLookups();

        const filters = { q, genreId, languageId, conditionId, exchangeable, minPrice, maxPrice, sort, limit, offset, page, };
        const knjige = await bookService.searchCatalog(filters);

        return { title: "Katalog", knjige, filters, genres: lookups.genres, languages: lookups.languages, conditions: lookups.conditions, };
    }
}

module.exports = new CatalogService();