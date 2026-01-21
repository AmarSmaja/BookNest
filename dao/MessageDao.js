const db = require("../models");
const { Op } = require("sequelize");

class MessageDao {
    create(conversationId, senderId, text, t) {
        const values = { conversationId: conversationId, posiljalacId: senderId, sadrzaj: text };
        if (t) return db.Message.create(values, { transaction: t });

        return db.Message.create(values);
    }

    listForConversation(conversationId, limit) {
        const lim = Number(limit);
        let l = 200;
        if (Number.isFinite(lim) && lim > 0) l = lim;

        return db.Message.findAll({ where: { conversationId: conversationId }, order: [["createdAt", "ASC"]], limit: l });
    }

    findLast(conversationId) {
        return db.Message.findOne({ where: { conversationId: conversationId }, order: [["createdAt", "DESC"]] });
    }

    countUnread(conversationId, meId, lastReadAt) {
        const where = { conversationId: conversationId, posiljalacId: { [Op.ne]: meId } };
        if (lastReadAt) where.createdAt = { [Op.gt]: lastReadAt };

        return db.Message.count({ where: where });
    }
}

module.exports = new MessageDao();