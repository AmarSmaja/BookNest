const sellerExchangesService = require("../services/SellerExchangesService");

class SellerExchangesController {
    async list(req, res) {
        const razmjene = await sellerExchangesService.izlistajMoje(req.session.user);
        console.log("SELLER EXCHANGES LIST user:", req.session.user.id, req.session.user.role);
        res.render("seller/exchanges/list", { title: "Razmjene (moje knjige)", razmjene, error: null });
    }

    async detail(req, res) {
        const data = await sellerExchangesService.detailForSeller(req.session.user, req.params.id);
        if (!data || !data.razmjena) return res.status(404).send("Razmjena nije pronadjena!");

        res.render("seller/exchanges/detail", { title: `Razmjena #${data.razmjena.id}`, razmjena: data.razmjena, currentUser: req.session.user, error: null });
    }

    async accept(req, res) {
        try {
            await sellerExchangesService.accept(req.session.user, req.params.id);
            return res.redirect(`/seller/exchanges/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async reject(req, res) {
        try {
            await sellerExchangesService.reject(req.session.user, req.params.id);
            return res.redirect(`/seller/exchanges/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async complete(req, res) {
        try {
            await sellerExchangesService.complete(req.session.user, req.params.id);
            return res.redirect(`/seller/exchanges/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async changeStatus(req, res) {
        try {
            await sellerExchangesService.changeStatus(req.session.user, req.params.id, req.body.status);
            return res.redirect(`/seller/exchanges/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new SellerExchangesController();