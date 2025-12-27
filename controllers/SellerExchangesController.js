const sellerExchangesService = require("../services/SellerExchangesService");

class SellerExchangesController {
    async list(req, res) {
        const razmjene = await sellerExchangesService.izlistajMoje(req.session.user);
        res.render("seller/exchanges/list", { title: "Razmjene (moje knjige)", razmjene, error: null });
    }

    async detail(req, res) {
        const data = await sellerExchangesService.getDetail(req.session.user, req.params.id);
        if (!data) return res.status(404).send("Razmjena nije pronadjena!");
        res.render("seller/exchanges/detail", { title: `Razmjena #${data.id}`, razmjena: data, error: null });
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