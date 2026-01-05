const db = require("../models");
const chatService = require("../services/ChatService");

class ChatController {
    async list(req, res) {
        const rows = await chatService.listForUser(req.session.user.id);
        return res.render("chat/list", { title: "Chat", rows: rows, error: null });
    }

    async startFromBook(req, res) {
        const bookId = Number(req.query.bookId);
        if (!Number.isFinite(bookId)) return res.status(400).send("Neispravan ID knjige!");

        const book = await db.Book.findByPk(bookId);
        if (!book) return res.status(404).send("Knjiga nije pronadjena!");

        const me = req.session.user.id;
        const other = book.prodavacId;

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

        return res.render("chat/detail", { title: "Razgovor", 
            conversation: data.conversation, 
            otherUser: data.otherUser, 
            messages: data.messages, 
            currentUser: req.session.user, 
            error: null 
        });
    }

    async send(req, res) {
        const convoId = Number(req.params.id);
        if (!Number.isFinite(convoId)) return res.status(400).send("Neispravan ID razgovora!");

        let body = "";
        if (req.body && req.body.body != null) {
            body = String(req.body.body).trim();
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