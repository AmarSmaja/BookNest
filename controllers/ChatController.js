const db = require("../models");
const chatService = require("../services/ChatService");

class ChatController {
    async list(req, res) {
        const rows = await chatService.listForUser(req.session.user.id);

        var conversations = [];

        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];

            var convo = r.conversation;
            var other = r.otherUser;
            var last = r.lastMessage;

            var id = null;
            if (convo && convo.id !== undefined && convo.id !== null) {
                id = convo.id;
            }

            var otherName = "Korisnik";
            if (other) {
                var ime = "";
                if (other.ime !== undefined && other.ime !== null) ime = String(other.ime);

                var prezime = "";
                if (other.prezime !== undefined && other.prezime !== null) prezime = String(other.prezime);

                var full = (ime + " " + prezime).trim();
                if (full.length > 0) otherName = full;
                else if (other.email !== undefined && other.email !== null) otherName = String(other.email);
            }

            var lastMessageText = "";
            if (last) {
                if (last.sadrzaj !== undefined && last.sadrzaj !== null) lastMessageText = String(last.sadrzaj);
                else if (last.text !== undefined && last.text !== null) lastMessageText = String(last.text);
                else if (last.body !== undefined && last.body !== null) lastMessageText = String(last.body);
            }

            var lastMessageAt = null;
            if (last && last.createdAt) lastMessageAt = last.createdAt;
            else if (convo && convo.zadnjaPorukaAt) lastMessageAt = convo.zadnjaPorukaAt;

            var unreadCount = 0;
            if (r.unreadCount !== undefined && r.unreadCount !== null) {
                unreadCount = Number(r.unreadCount);
                if (!Number.isFinite(unreadCount) || unreadCount < 0) unreadCount = 0;
            }

            conversations.push({
                id: id,
                otherUserName: otherName,
                lastMessageText: lastMessageText,
                lastMessageAt: lastMessageAt,
                unreadCount: unreadCount
            });
        }

        return res.render("chat/list", {
            title: "Chat",
            conversations: conversations,
            rows: conversations,
            error: null
        });
    }

    async startFromBook(req, res) {
        const bookId = Number(req.query.bookId);
        if (!Number.isFinite(bookId)) return res.status(400).send("Neispravan ID knjige!");

        const book = await db.Book.findByPk(bookId);
        if (!book) return res.status(404).send("Knjiga nije pronadjena!");

        const me = req.session.user.id;
        let other = null;

        if (book.sellerId !== undefined && book.sellerId !== null) {
            other = Number(book.sellerId);
        } else if (book.prodavacId !== undefined && book.prodavacId !== null) {
            other = Number(book.prodavacId);
        }

        if (!Number.isFinite(other)) return res.status(400).send("Neispravan ID prodavaca!");

        if (me === other) return res.status(400).send("Ne mozes zapoceti chat sa samim sobom!");

        const convo = await chatService.getOrCreateConversation(me, other);
        return res.redirect("/chat/" + convo.id);
    }

    async start(req, res) {
        const otherId = Number(req.params.userId);
        if (!Number.isFinite(otherId)) return res.status(400).send("Neispravan ID korisnika!");

        const meId = req.session.user.id;
        if (meId === otherId) return res.status(400).send("Ne mozes zapoceti chat sa samim sobom!");

        const convo = await chatService.getOrCreateConversation(meId, otherId);
        return res.redirect("/chat/" + convo.id);
    }

    async detail(req, res) {
        const convoId = Number(req.params.id);
        if (!Number.isFinite(convoId)) return res.status(400).send("Neispravan ID razgovora!");

        const data = await chatService.getDetailForUser(req.session.user.id, convoId);
        if (!data) return res.status(404).send("Razgovor nije pronadjen!");

        const rows = await chatService.listForUser(req.session.user.id);

        return res.render("chat/detail", { title: "Razgovor", 
            conversation: data.conversation, 
            otherUser: data.otherUser, 
            messages: data.messages, 
            currentUser: req.session.user,
            rows: rows,
            conversations: rows,
            activeConversationId: convoId,
            error: null 
        });
    }

    async send(req, res) {
        const convoId = Number(req.params.id);
        if (!Number.isFinite(convoId)) return res.status(400).send("Neispravan ID razgovora!");

        let body = "";

        if (req.body) {
            if (req.body.text !== undefined && req.body.text !== null) {
                body = String(req.body.text).trim();
            } else if (req.body.body !== undefined && req.body.body !== null) {
                body = String(req.body.body).trim();
            }
        }

        if (body.length === 0) return res.redirect("/chat/" + convoId);

        try {
            await chatService.sendMessage(req.session.user.id, convoId, body);
            return res.redirect("/chat/" + convoId);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new ChatController();