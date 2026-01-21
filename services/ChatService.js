  const db = require("../models");
  const notificationDao = require("../dao/NotificationDao");
  const conversationDao = require("../dao/ConversationDao");
  const messageDao = require("../dao/MessageDao");
  const userDao = require("../dao/UserDao");
  const bookDao = require("../dao/BookDao");

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

      const otherUser = await userDao.findById(other);
      if (!otherUser) throw new Error("Korisnik ne postoji!");

      const pair = this._normalizePair(me, other);

      return db.sequelize.transaction(async (t) => {
        let convo = await conversationDao.findDirectByPair(pair.a, pair.b, t);
        if (!convo) convo = await conversationDao.createDirect(pair.a, pair.b, t);

        const rMe = await conversationDao.find(convo.id, me, t);
        if (!rMe) await conversationDao.create(convo.id, me, null, t);

        const rOther = await conversationDao.find(convo.id, other, t);
        if (!rOther) await conversationDao.create(convo.id, other, null, t);

        return convo;
      });
    }

    async listForUser(meId) {
      const me = Number(meId);
      if (!Number.isFinite(me)) return [];

      const convos = await conversationDao.listDirectForUser(me);

      const rows = [];

      for (let i = 0; i < convos.length; i++) {
        const c = convos[i];

        let otherId = c.userAId;
        if (otherId === me) otherId = c.userBId;

        const otherUser = await userDao.findPublicById(otherId);
        const lastMsg = await messageDao.findLast(c.id);
        const readRow = await conversationDao.find(c.id, me);

        let lastReadAt = null;
        if (readRow && readRow.zadnjeProcitanoAt) lastReadAt = readRow.zadnjeProcitanoAt;

        const unread = await messageDao.countUnread(c.id, me, lastReadAt);

        rows.push({
          conversation: c,
          otherUser: otherUser,
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

      const convo = await conversationDao.findById(cid);
      if (!convo) return null;

      const allowed = (convo.userAId === me) || (convo.userBId === me);
      if (!allowed) return null;

      let otherId = convo.userAId;
      if (otherId === me) otherId = convo.userBId;

      const otherUser = await userDao.findPublicById(otherId);

      const messages = await messageDao.listForConversation(cid, 200);
      const now = new Date();

      return db.sequelize.transaction(async (t) => {
        const existing = await conversationDao.find(cid, me, t);

        if (existing) {
          await conversationDao.update(cid, me, now, t);
        } else {
          await conversationDao.create(cid, me, now, t);
        }

        return { conversation: convo, otherUser, messages };
      });
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

      const convo = await conversationDao.findById(cid);
      if (!convo) throw new Error("Razgovor ne postoji!");

      const ok = (convo.userAId === me) || (convo.userBId === me);
      if (!ok) throw new Error("Nemate pristup ovom razgovoru!");

      let otherId = convo.userAId;
      if (otherId === me) otherId = convo.userBId;

      const now = new Date();

      return db.sequelize.transaction(async (t) => {
        const msg = await messageDao.create(cid, me, text, t);
        
        await conversationDao.touchLastMessageAt(cid, now, t);
        await conversationDao.update(cid, me, now, t);

        await notificationDao.create({ userId: otherId, tip: "Nova_poruka", payloadJson: { conversationId: cid, fromUserId: me, messageId: msg.id } }, t);

        return msg;
      });
    }

    async startConversationFromBook(meId, bookId) {
      const me = Number(meId);
      if (!Number.isFinite(me)) throw new Error("Neispravan user ID!");

      const id = Number(bookId);
      if (!Number.isFinite(id)) throw new Error("Neispravan ID knjige!");

      const book = await bookDao.findById(id);
      if (!book) throw new Error("Knjiga nije pronadjena!");

      let other = null;

      if (book.prodavacId !== undefined && book.prodavacId !== null) {
        other = Number(book.prodavacId);
      } else {
        if (book.sellerId !== undefined && book.sellerId !== null) {
          other = Number(book.sellerId);
        }
      }

      if (!Number.isFinite(other)) throw new Error("Neispravan ID prodavaca!");
      if (me === other) throw new Error("Ne mozes zapoceti chat sa samim sobom!");

      return this.getOrCreateConversation(me, other);
    }
  }

  module.exports = new ChatService();