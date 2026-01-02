const sellerApprovingService = require("../services/SellerApprovingService");

class AdminSellersController {
    async list(req, res) {
        if (!req.session || !req.session.user || req.session.user.role !== "Admin") {
            return res.status(403).send("Nemate pristup!");
        }

        const rows = await sellerApprovingService.listPending(req.session.user);

        return res.render("admin/seller-requests/list", { title: "Zahtjevi za prodavaca", rows: rows, error: null });
    }

    async approve(req, res) {
        try {
            if (!req.session || !req.session.user || req.session.user.role !== "Admin") {
                return res.status(403).send("Nemate pristup!");
            }

            await sellerApprovingService.odobri(req.session.user, req.params.userId);
            return res.redirect("/admin/seller-requests");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async reject(req, res) {
        try {
            if (!req.session || !req.session.user || req.session.user.role !== "Admin") {
                return res.status(403).send("Nemate pristup!");
            }

            await sellerApprovingService.odbij(req.session.user, req.params.userId);
            return res.redirect("/admin/seller-requests");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new AdminSellersController();