const db = require("../models");
const sellerApprovingService = require("../services/SellerApprovingService");

class SellerApprovingController {
    async showApply(req, res) {
        try {
            const data = await sellerApprovingService.getApplyPageData(req.session.user);
            return res.render("seller/apply", { title: "Postani prodavac!", error: null, values: {}, cities: data.cities });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async apply(req, res) {
        try {
            await sellerApprovingService.podnesiZahtjev(req.session.user, req.body);
            return res.redirect("/");
        } catch (e) {
            try {
                const data = await sellerApprovingService.getApplyPageData(req.session.user);
                return res.status(400).render("seller/apply", { title: "Postani prodavac!", error: e.message, values: req.body || {}, cities: data.cities });
            } catch (e2) {
                return res.status(400).render("seller/apply", { title: "Postani prodavac!", error: e.message, values: req.body || {}, cities: [] });
            }
        }
    }
}

module.exports = new SellerApprovingController();