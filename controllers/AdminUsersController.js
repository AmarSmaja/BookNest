const adminUserService = require("../services/AdminUserService");

class AdminUsersController {
    async list(req, res) {
        const users = await adminUserService.listUsers();
        res.render("admin/users", { users, error: null });
    }

    async changeRole(req, res) {
        try {
            await adminUserService.setRole(req.params.id, req.body.role);
            res.redirect("/admin/users");
        } catch (e) {
            const users = await adminUserService.listUsers();
            res.status(400).render("admin/users", { users, error: e.message });
        }
    }

    async changeStatus(req, res) {
        try {
            await adminUserService.setStatus(req.params.id, req.body.status);
            res.redirect("/admin/users");
        } catch (e) {
            const users = await adminUserService.listUsers();
            res.status(400).render("admin/users", { users, error: e.message });
        }
    }

    async block(req, res) {
        try {
            const { mode } = req.body;
            if (mode === "permanent") await adminUserService.blockUser(req.params.id, null);
            else await adminUserService.blockUser(req.params.id, 15);
            res.redirect("/admin/users");
        } catch (e) {
            const users = await adminUserService.listUsers();
            res.status(400).render("admin/users", { users, error: e.message });
        }
    }

    async unblock(req, res) {
        try {
            await adminUserService.unblockUser(req.params.id);
            res.redirect("/admin/users");
        } catch (e) {
            const users = await adminUserService.listUsers();
            res.status(400).render("admin/users", { users, error: e.message });
        }
    }
}

module.exports = new AdminUsersController();