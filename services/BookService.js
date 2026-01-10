const bookDao = require("../dao/BookDao");
const userInterestsDao = require("../dao/UserInterestsDao");

class BookService {
    async getHomeBooks() {
        return bookDao.listPublic({ limit: 24, offset: 0 });
    }

    async getRandomHomeBooks(limit) {
        return bookDao.listRandomPublic(limit);
    }

    async getPopularBooks(limit) {
        return bookDao.listPopularPublic(limit);
    }

    async getRecommendedBooksForUser(userId, limit) {
        const ids = await userInterestsDao.getInterestIds(userId);
        return bookDao.listRecommendedByInterest(ids.genreIds, ids.languageIds, limit);
    }

    async getBookDetail(id) {
        const bookId = Number(id);
        if (!Number.isFinite(bookId) || bookId <= 0) return null;
        return bookDao.findPublicById(bookId);
    }
}

module.exports = new BookService();