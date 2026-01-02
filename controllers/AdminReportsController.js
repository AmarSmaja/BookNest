const adminReportsService = require("../services/AdminReportsService");

class AdminReportsController {
    async list(req, res) {
        const reports = await adminReportsService.listOpen();
        return res.render("admin/reports/list", { title: "Reportovi", reports: reports, error: null });
    }

    async detail(req, res) {
        const report = await adminReportsService.getDetail(req.params.id);
        if (!report) return res.status(404).send("Report nije pronadjen!");

        return res.render("admin/reports/detail", { title: "Detalji reporta", report: report, error: null });
    }

    async changeStatus(req, res) {
        try {
            await adminReportsService.changeStatus(req.session.user, req.params.id, req.body.status);
            return res.redirect(`/admin/reports/${req.params.id}`);
        } catch (e) {
            const report = await adminReportsService.getDetail(req.params.id);
            if (!report) return res.status(404).send("Report nije pronadjen!");
            return res.status(400).render("admin/reports/detail", { title: "Detalji reporta", report: report, error: e.message });
        }
    }
}

module.exports = new AdminReportsController();