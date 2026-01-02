const db = require("../models");

class NotificationDao {
    async create({ userId, tip, payloadJson }, t) {
        const values = { userId, tip, payloadJson, isRead: false };

        if (t) {
            return db.Notification.create(values, { transaction: t });
        }

        return db.Notification.create(values);
    }

    async listForUser(userId) {
        const uid = Number(userId);
        if (!Number.isFinite(uid)) return [];

        return db.Notification.findAll({
            where: { userId: uid },
            order: [["id", "DESC"]],
        });
    }

    async oznaciProcitano(id, userId) {
        const nid = Number(id);
        const uid = Number(userId);
        if (!Number.isFinite(nid) || !Number.isFinite(uid)) return 0;

        return db.Notification.update(
            { isRead: true },
            { where: { id: nid, userId: uid } }
        );
    }

    async oznaciSveProcitano(userId) {
        const uid = Number(userId);
        if (!Number.isFinite(uid)) return 0;

        return db.Notification.update(
            { isRead: true },
            { where: { userId: uid, isRead: false } }
        );
    }
}

module.exports = new NotificationDao();