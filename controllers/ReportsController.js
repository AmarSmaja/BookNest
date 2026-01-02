const reportsService = require("../services/ReportsService");

class ReportsController {
    async showCreate(req, res) {
        try {
            const bookId = req.query.bookId;
            const data = await reportsService.getCreateData(req.session.user, bookId);

            return res.render("reports/new", { title: "Report", targetBook: data.targetBook, error: null, values: { razlog: "" }, });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async create(req, res) {
        try {
            const bookId = req.body.bookId;
            const razlog = req.body.razlog;

            const report = await reportsService.createReport(req.session.user, bookId, razlog);

            return res.redirect("/books/" + report.prijavljenaKnjigaId);
        } catch (e) {
            let targetBook = null;
            try {
                targetBook = await reportsService.getBookForForm(req.body.bookId);
            } catch (e) {
                targetBook = null;
            }

            return res.status(400).render("reports/new", { title: "Report", targetBook: targetBook, error: e.message, values: { razlog: req.body.razlog || "" }, });
        }
    }
}

module.exports = new ReportsController();