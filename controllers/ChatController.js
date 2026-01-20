const chatService = require("../services/ChatService");

class ChatController {
    async list(req, res) {
        const rows = await chatService.listForUser(req.session.user.id);

        let conversations = [];

        for (let i = 0; i < rows.length; i++) {
            let r = rows[i];

            let convo = r.conversation;
            let other = r.otherUser;
            let last = r.lastMessage;

            let id = null;
            if (convo && convo.id !== undefined && convo.id !== null) {
                id = convo.id;
            }

            let otherName = "Korisnik";
            if (other) {
                let ime = "";
                if (other.ime !== undefined && other.ime !== null) ime = String(other.ime);

                let prezime = "";
                if (other.prezime !== undefined && other.prezime !== null) prezime = String(other.prezime);
                
                let full = (ime + " " + prezime).trim();
                if (full.length > 0) {
                    otherName = full;
                } else {
                    if (other.email !== undefined && other.email !== null) {
                        otherName = String(other.email);
                    }
                }
            }

            let lastMessageText = "";
            if (last) {
                if (last.sadrzaj !== undefined && last.sadrzaj !== null) lastMessageText = String(last.sadrzaj);
                else if (last.text !== undefined && last.text !== null) lastMessageText = String(last.text);
                else if (last.body !== undefined && last.body !== null) lastMessageText = String(last.body);
            }

            let lastMessageAt = null;
            if (last && last.createdAt) {
                lastMessageAt = last.createdAt;
            } else {
                if (convo && convo.zadnjaPorukaAt) {
                    lastMessageAt = convo.zadnjaPorukaAt;
                }
            }

            let unreadCount = 0;
            if (r.unreadCount !== undefined && r.unreadCount !== null) {
                let n = Number(r.unreadCount);
                if (Number.isFinite(n) && n >= 0) unreadCount = n;
            }

            conversations.push({ id: id, otherUserName: otherName, lastMessageText: lastMessageText, lastMessageAt: lastMessageAt, unreadCount: unreadCount });
        }

        return res.render("chat/list", { title: "Chat", conversations: conversations, rows: conversations, error: null });
    }

    async startFromBook(req, res) {
        try {
            let bookId = Number(req.query.bookId);
            if (!Number.isFinite(bookId)) return res.status(400).send("Neispravan ID knjige!");

            let meId = null;
            if (req.session && req.session.user && req.session.user.id !== undefined && req.session.user.id !== null) {
                meId = req.session.user.id;
            }
            if (!meId) return res.status(401).send("Nisi logovan!");

            const convo = await chatService.startConversationFromBook(meId, bookId);
            return res.redirect("/chat/" + convo.id);
        } catch (e) {
            let msg = "Greska";
            if (e && e.message) msg = e.message;

            if (msg.indexOf("Neispravan") >= 0) return res.status(400).send(msg);
            if (msg.indexOf("nije pronadjena") >= 0 || msg.indexOf("nije prona") >= 0) return res.status(404).send(msg);
            if (msg.indexOf("samim sobom") >= 0) return res.status(400).send(msg);
            
            return res.status(400).send(msg);
        }
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