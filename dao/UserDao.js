const db = require("../models");

class UserDao {
    findByEmail(email, t) {
        const opts = { where: { email: email } };
        if (t) opts.transaction = t;
        return db.User.findOne(opts);
    }

    findById(id, t) {
        const opts = {};
        if (t) opts.transaction = t;
        return db.User.findByPk(id, opts);
    }

    findPublicById(id, t) {
        const opts = { attributes: ["id", "ime", "prezime", "role", "status", "createdAt", "updatedAt", "profileImageUrl"], };
        if (t) opts.transaction = t;
        return db.User.findByPk(id, opts);
    }

    create(data, t) {
        if (t) return db.User.create(data, { transaction: t });
        return db.User.create(data);
    }

    listAll(t) {
        const opts = { order: [["id", "ASC"]] };
        if (t) opts.transaction = t;
        return db.User.findAll(opts);
    }

    async updateById(id, patch, t) {
        const user = await this.findById(id, t);
        if (!user) return null;
        return user.update(patch, t ? { transaction: t } : undefined);
    }

    findWithPasswordById(id, t) {
        const opts = { attributes: ["id", "passwordHash"] };
        if (t) opts.transaction = t;
        return db.User.findByPk(id, opts);
    }
}

module.exports = new UserDao();