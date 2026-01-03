const adminUserService = require("../services/AdminUserService");

class AdminUsersController {
    async list(req, res) {
        const users = await adminUserService.listUsers(req.session.user);
        return res.render("admin/users/list", { title: "Lista korisnika", users, error: null });
    }

    async changeRole(req, res) {
        await adminUserService.setRole(req.session.user, req.params.id, req.body.role);
        return res.redirect("/admin/users");
    }

    async changeStatus(req, res) {
        await adminUserService.setStatus(req.session.user, req.params.id, req.body.status);
        return res.redirect("/admin/users");
    }

    async block(req, res) {
        await adminUserService.blockUser(req.session.user, req.params.id, req.body.days);
        return res.redirect("/admin/users");
    }

    async unblock(req, res) {
        await adminUserService.unblockUser(req.session.user, req.params.id);
        return res.redirect("/admin/users");
    }
}

module.exports = new AdminUsersController();