const db = require("../models");
const { Op } = require("sequelize");

class ConversationDao {
    findById(id, t) {
        const opts = {};
        if (t) opts.transaction = t;

        return db.Conversation.findByPk(id, opts);
    }

    findDirectByPair(userAId, userBId, t) {
        const opts = { where: { userAId: userAId, userBId: userBId, orderId: null } };
        if (t) opts.transaction = t;

        return db.Conversation.findOne(opts);
    }

    createDirect(userAId, userBId, t) {
        const values = { userAId: userAId, userBId: userBId, orderId: null, zadnjaPorukaAt: null };
        if (t) return db.Conversation.create(values, { transaction: t });
        
        return db.Conversation.create(values); 
    }

    listDirectForUser(userId) {
        return db.Conversation.findAll({
            where: {
                orderId: null,
                [Op.or]: [{ userAId: userId }, { userBId: userId }],
            },
            order: [
                ["zadnjaPorukaAt", "DESC"],
                ["updatedAt", "DESC"],
                ["id", "DESC"],
            ],
        });
    }

    touchLastMessageAt(conversationId, when, t) {
        const patch = { zadnjaPorukaAt: when };
        const opts = { where: { id: conversationId } };
        if (t) opts.transaction = t;
        
        return db.Conversation.update(patch, opts);
    }

    find(conversationId, userId, t) {
        const opts = { where: { conversationId: conversationId, userId: userId } };
        if (t) opts.transaction = t;

        return db.ConversationRead.findOne(opts);
    }

    create(conversationId, userId, at, t) {
        const cid = Number(conversationId);
        if (!Number.isFinite(cid)) throw new Error("Neispravan conversationId u conversationRead DAO!");

        const uid = Number(userId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan userId");

        let when = null;
        if (at !== undefined && at !== null) {
            const d = new Date(at);
            if (!isNaN(d.getTime())) when = d; 
        }

        const values = { conversationId: cid, userId: uid, zadnjeProcitanoAt: when };
        if (t) return db.ConversationRead.create(values, { transaction: t });

        return db.ConversationRead.create(values);
    }

    update(conversationId, userId, at, t) {
        const patch = { zadnjeProcitanoAt: at };
        const opts = { where: { conversationId: conversationId, userId: userId } };
        if (t) opts.transaction = t;

        return db.ConversationRead.update(patch, opts);
    }
}

module.exports = new ConversationDao();