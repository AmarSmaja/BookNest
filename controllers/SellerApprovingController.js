const sellerApprovingService = require("../services/SellerApprovingService");

class SellerApprovingController {
    async showApply(req, res) {
        return res.render("seller/apply", { title: "Postani prodavac!", error: null, values: {} });
    }

    async apply(req, res) {
        try {
            await sellerApprovingService.podnesiZahtjev(req.session.user, req.body);
            return res.redirect("/");
        } catch (e) {
            return res.status(400).render("seller/apply", { title: "Postani prodavac!", error: e.message, values: req.body });
        }
    }
}

module.exports = new SellerApprovingController();