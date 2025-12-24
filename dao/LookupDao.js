const db = require("../models");

class LookupDao {
    async getBookFormLookups() {
        const [genres, languages, conditions] = await Promise.all([
            db.Genre.findAll({ order: [["id", "ASC"]] }),
            db.Language.findAll({ order: [["id", "ASC"]] }),
            db.BookCondition.findAll({ order: [["id", "ASC"]] }),
        ]);

        return { genres, languages, conditions };
    }
}

module.exports = new LookupDao();