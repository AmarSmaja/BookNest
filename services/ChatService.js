const db = require("../models");
const notificationDao = require("../dao/NotificationDao");
const { Op } = require("sequelize");

class ChatService {
  _normalizePair(id1, id2) {
    let a = Number(id1);
    let b = Number(id2);

    if (!Number.isFinite(a)) throw new Error("Neispravan user id!");
    if (!Number.isFinite(b)) throw new Error("Neispravan user id!");

    if (a > b) {
      const tmp = a;
      a = b;
      b = tmp;
    }

    return { a, b };
  }

  async getOrCreateConversation(meId, otherId) {
    const me = Number(meId);
    const other = Number(otherId);

    if (!Number.isFinite(me)) throw new Error("Neispravan user id!");
    if (!Number.isFinite(other)) throw new Error("Neispravan user id!");
    if (me === other) throw new Error("Ne mozes otvoriti chat sa sobom!");

    const otherUser = await db.User.findByPk(other);
    if (!otherUser) throw new Error("Korisnik ne postoji!");

    const pair = this._normalizePair(me, other);

    return db.sequelize.transaction(async (t) => {
      let convo = await db.Conversation.findOne({
        where: {
          userAId: pair.a,
          userBId: pair.b,
          orderId: null,
        },
        transaction: t,
      });

      if (!convo) {
        convo = await db.Conversation.create(
          {
            userAId: pair.a,
            userBId: pair.b,
            orderId: null,
            zadnjaPorukaAt: null,
          },
          { transaction: t }
        );
      }

      const rMe = await db.ConversationRead.findOne({
        where: { conversationId: convo.id, userId: me },
        transaction: t,
      });
      if (!rMe) {
        await db.ConversationRead.create(
          { conversationId: convo.id, userId: me, zadnjeProcitanoAt: null },
          { transaction: t }
        );
      }

      const rOther = await db.ConversationRead.findOne({
        where: { conversationId: convo.id, userId: other },
        transaction: t,
      });
      if (!rOther) {
        await db.ConversationRead.create(
          { conversationId: convo.id, userId: other, zadnjeProcitanoAt: null },
          { transaction: t }
        );
      }

      return convo;
    });
  }

  async listForUser(meId) {
    const me = Number(meId);
    if (!Number.isFinite(me)) return [];

    const convos = await db.Conversation.findAll({
      where: {
        [Op.or]: [{ userAId: me }, { userBId: me }],
        orderId: null,
      },
      order: [
        ["zadnjaPorukaAt", "DESC"],
        ["updatedAt", "DESC"],
        ["id", "DESC"],
      ],
    });

    const rows = [];

    for (let i = 0; i < convos.length; i++) {
      const c = convos[i];

      let otherId = c.userAId;
      if (otherId === me) otherId = c.userBId;

      const otherUser = await db.User.findByPk(otherId);

      const lastMsg = await db.Message.findOne({
        where: { conversationId: c.id },
        order: [["createdAt", "DESC"]],
      });

      const readRow = await db.ConversationRead.findOne({
        where: { conversationId: c.id, userId: me },
      });

      let lastReadAt = null;
      if (readRow && readRow.zadnjeProcitanoAt) lastReadAt = readRow.zadnjeProcitanoAt;

      let unread = 0;
      if (lastReadAt) {
        unread = await db.Message.count({
          where: {
            conversationId: c.id,
            posiljalacId: { [Op.ne]: me },
            createdAt: { [Op.gt]: lastReadAt },
          },
        });
      } else {
        unread = await db.Message.count({
          where: {
            conversationId: c.id,
            posiljalacId: { [Op.ne]: me },
          },
        });
      }

      rows.push({
        conversation: c,
        otherUser,
        lastMessage: lastMsg,
        unreadCount: unread,
      });
    }

    return rows;
  }

  async getDetailForUser(meId, conversationId) {
    const me = Number(meId);
    const cid = Number(conversationId);

    if (!Number.isFinite(me)) return null;
    if (!Number.isFinite(cid)) return null;

    const convo = await db.Conversation.findByPk(cid);
    if (!convo) return null;

    const allowed = (convo.userAId === me) || (convo.userBId === me);
    if (!allowed) return null;

    let otherId = convo.userAId;
    if (otherId === me) otherId = convo.userBId;

    const otherUser = await db.User.findByPk(otherId);

    const messages = await db.Message.findAll({
      where: { conversationId: cid },
      order: [["createdAt", "ASC"]],
      limit: 200,
    });

    // mark as read
    const existing = await db.ConversationRead.findOne({
      where: { conversationId: cid, userId: me },
    });

    if (existing) {
      await db.ConversationRead.update(
        { zadnjeProcitanoAt: new Date() },
        { where: { conversationId: cid, userId: me } }
      );
    } else {
      await db.ConversationRead.create({
        conversationId: cid,
        userId: me,
        zadnjeProcitanoAt: new Date(),
      });
    }

    return { conversation: convo, otherUser, messages };
  }

  async sendMessage(meId, conversationId, body) {
    const me = Number(meId);
    const cid = Number(conversationId);

    if (!Number.isFinite(me)) throw new Error("Neispravan user id!");
    if (!Number.isFinite(cid)) throw new Error("Neispravan conversation id!");

    let text = "";
    if (body != null) text = String(body);
    text = text.trim();

    if (text.length === 0) throw new Error("Poruka ne smije biti prazna!");
    if (text.length > 5000) throw new Error("Poruka je preduga (max 5000 karaktera)!");

    const convo = await db.Conversation.findByPk(cid);
    if (!convo) throw new Error("Razgovor ne postoji!");

    const ok = (convo.userAId === me) || (convo.userBId === me);
    if (!ok) throw new Error("Nemate pristup ovom razgovoru!");

    let otherId = convo.userAId;
    if (otherId === me) otherId = convo.userBId;

    return db.sequelize.transaction(async (t) => {
      const msg = await db.Message.create(
        { conversationId: cid, posiljalacId: me, sadrzaj: text },
        { transaction: t }
      );

      await db.Conversation.update(
        { zadnjaPorukaAt: new Date() },
        { where: { id: cid }, transaction: t }
      );

      await db.ConversationRead.update(
        { zadnjeProcitanoAt: new Date() },
        { where: { conversationId: cid, userId: me }, transaction: t }
      );

      await notificationDao.create(
        {
          userId: otherId,
          tip: "Nova_poruka",
          payloadJson: { conversationId: cid, fromUserId: me, messageId: msg.id },
        },
        t
      );

      return msg;
    });
  }
}

module.exports = new ChatService();
