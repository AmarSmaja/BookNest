const db = require("../models");

class SellerProfileDao {
    findByUserId(userId) {
        return db.SellerProfile.findOne({ where: { userId: userId } });
    }

    create(data, t) {
        return db.SellerProfile.create(data, { transaction: t });
    }

    findPending() {
        return db.SellerProfile.findAll({
            where: { status: "PENDING" },
            order: [["id", "ASC"]],
        });
    }

    findById(id) {
        return db.SellerProfile.findByPk(id);
    }

    updateStatus(userId, status, reviewedAt, t) {
        return db.SellerProfile.update(
            { status: status, reviewedAt: reviewedAt },
            { where: { userId: userId }, transaction: t }
        );
    }
}

module.exports = new SellerProfileDao();