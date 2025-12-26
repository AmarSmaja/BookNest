const notificationDao = require("../dao/NotificationDao");

class NotificationsController {
    async list(req, res) {
        const notifikacije = await notificationDao.listForUser(req.session.user.id);
        res.render("notifications/list", { title: "Notifikacije", notifikacije, error: null });
    }

    async oznaciProcitano(req, res) {
        await notificationDao.oznaciProcitano(req.params.id, req.session.user.id);
        return res.redirect("/notifications");
    }
}

module.exports = new NotificationsController();