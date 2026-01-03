const adminReportsService = require("../services/AdminReportsService");

class AdminReportsController {
    async list(req, res) {
        const reports = await adminReportsService.listOpen();
        return res.render("admin/reports/list", { title: "Reportovi", reports: reports, error: null });
    }

    async detail(req, res) {
        const data = await adminReportsService.getDetail(req.params.id);
        if (!data) return res.status(404).send("Report nije pronadjen!");

        return res.render("admin/reports/detail", { title: "Detalji reporta", report: data.report, targetBook: data.targetBook, targetUser: data.targetUser, error: null });
    }

    async changeStatus(req, res) {
        try {
            await adminReportsService.changeStatus(req.session.user, req.params.id, req.body.status);
            return res.redirect(`/admin/reports/${req.params.id}`);
        } catch (e) {
            const report = await adminReportsService.getDetail(req.params.id);
            if (!report) return res.status(404).send("Report nije pronadjen!");
            return res.status(400).render("admin/reports/detail", { 
                title: "Detalji reporta", 
                report: data.report, 
                targetBook: data.targetBook, 
                targetUser: data.targetUser, 
                error: e.message 
            });
        }
    }
    
    async archiveBook(req, res) {
        try {
            await adminReportsService.arhivirajKnjigu(req.session.user, req.params.id);
            return res.redirect(`/admin/reports/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async activateBook(req, res) {
        try {
            await adminReportsService.aktivirajKnjigu(req.session.user, req.params.id);
            return res.redirect(`/admin/reports/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new AdminReportsController();