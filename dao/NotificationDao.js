const db = require("../models");

class NotificationDao {
    async create({ userId, tip, payloadJson, }, t) {
        return db.Notification.create(
            { userId, tip, payloadJson, isRead: false },
            t ? { transaction: t } : undefined
        );
    }

    async listForUser(userId) {
        return db.Notification.findAll({
            where: { userId },
            order: [["id", "ASC"]],
        });
    }

    async oznaciProcitano(id, userId) {
        return db.Notification.update(
            { isRead: true },
            { where: { id, userId } }
        );
    }
}

module.exports = new NotificationDao();