const db = require("../models");

class ExchangeRequestDao {
    findAll(t) {
        const opts = { order: [["id", "ASC"]] };
        if (t) opts.transaction = t;

        return db.ExchangeRequest.findAll(opts);
    }

    findById(id, t) {
        const opts = {};
        if (t) opts.transaction = t;

        return db.ExchangeRequest.findByPk(id, opts);
    }
}

module.exports = new ExchangeRequestDao();