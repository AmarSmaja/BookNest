const bookDao = require("../dao/BookDao");

class BookService {
    async getHomeBooks() {
        return bookDao.listPublic({ limit: 24, offset: 0 });
    }

    async getBookDetail(id) {
        const bookId = Number(id);
        if (!Number.isFinite(bookId) || bookId <= 0) return null;
        return bookDao.findPublicById(bookId);
    }
}

module.exports = new BookService();