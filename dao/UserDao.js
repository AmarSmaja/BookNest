const User = require("../models/users/User");

class UserDao {
    async findByEmail(email) {
        return User.findOne({ where: { email } });
    }

    async findById(id) {
        return User.findByPk(id);
    }

    async create(data) {
        return User.create(data);
    }

    async listAll() {
        return User.findAll({ order: [["id", "ASC"]] });
    }

    async updateById(id, patch) {
        const user = await User.findByPk(id);
        if (!user) return null;
        return user.update(patch);
    }
}

module.exports = new UserDao();