const sellerApprovingService = require("../services/SellerApprovingService");

class AdminSellersController {
    async list(req, res) {
        const zahtjevi = await sellerApprovingService.listPending();
        return res.render("admin/seller-requests/list", { title: "Zahtjevi za prodavaca", zahtjevi, error: null });
    }

    async approve(req, res) {
        try {
            await sellerApprovingService.odobri(req.session.user, req.params.id);
            return res.redirect("/");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async reject(req, res) {
        try {
            await sellerApprovingService.odbij(req.session.user, req.params.id);
            return res.redirect("/");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new AdminSellersController();