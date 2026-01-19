const adminLookupsService = require("../services/AdminLookupsService");

class AdminLookupsController {
    async list(req, res) {
        try {
            const data = await adminLookupsService.list(req.params.type);
            return res.render("admin/lookups", { title: data.title, type: data.type, rows: data.rows, error: null });
        } catch (e) {
            return res.status(404).send(e.message);
        }
    }

    async create(req, res) {
        try {
            await adminLookupsService.create(req.params.type, req.body);
            return res.redirect(`/admin/lookups/${req.params.type}`);
        } catch (e) {
            try {
                const data = await adminLookupsService.list(req.params.type);
                return res.status(400).render("admin/lookups", { title: data.title, type: data.type, rows: data.rows, error: e.message });
            } catch {
                return res.status(400).send(e.message);
            }
        }
    }

    async update(req, res) {
        try {
            await adminLookupsService.update(req.params.type, req.params.id, req.body);
            return res.redirect(`/admin/lookups/${req.params.type}`);
        } catch (e) {
            try {
                const data = await adminLookupsService.list(req.params.type);
                return res.status(400).render("admin/lookups", { title: data.title, type: data.type, rows: data.rows, error: e.message });
            } catch {
                return res.status(400).send(e.message);
            }
        }
    }

    async remove(req, res) {
        try {
            await adminLookupsService.remove(req.params.type, req.params.id);
            return res.redirect(`/admin/lookups/${req.params.type}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new AdminLookupsController();