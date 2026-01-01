const db = require("../models");

class SellerProfileDao {
    findByUserId(userId, t) {
        const opts = {};
        if (t) opts.transaction = t;
        return db.SellerProfile.findByPk(userId, opts);
    }

    create(data, t) {
        return db.SellerProfile.create(data, { transaction: t });
    }

    updateStatus(userId, status, reviewedAt, t) {
        return db.SellerProfile.update(
            { status: status, reviewedAt: reviewedAt },
            { where: { userId: userId }, transaction: t }
        );
    }

    listPending(t) {
        const opts = {
            where: { status: "PENDING" },
            order: [["requestedAt", "ASC"]],
        };

        if (t) opts.transaction = t;

        return db.SellerProfile.findAll(opts);
    }
}

module.exports = new SellerProfileDao();