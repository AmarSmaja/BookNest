const exchangeService = require("../services/ExchangeService");

class ExchangesController {
    async list(req, res) {
        const razmjene = await exchangeService.izlistajMojeRazmjene(req.session.user.id);
        res.render("exchanges/list", { title: "Moje razmjene", razmjene, error: null });
    }

    async detail(req, res) {
        const data = await exchangeService.uzmiMojeDetalje(req.session.user.id, req.params.id);
        if (!data) return res.status(404).send("Razmjena nije pronadjena!");
        res.render("exchanges/detail", { title: `Razmjena #${data.id}`, razmjena: data, error: null });
    }

    async create(req, res) {
        try {
            const requestedBookIds = Array.isArray(req.body.requestedBookIds)
            ? req.body.requestedBookIds
            : [req.body.requestedBookIds].filter(Boolean);

            const offeredBookIds = Array.isArray(req.body.offeredBookIds)
            ? req.body.offeredBookIds
            : [req.body.offeredBookIds].filter(Boolean);

            const razmjena = await exchangeService.createExchangeFromBooks(req.session.user, requestedBookIds, offeredBookIds);
            return res.redirect(`/exchanges/${razmjena.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async cancel(req, res) {
        try {
            await exchangeService.otkaziRazmjenu(req.session.user, req.params.id);
            return res.redirect(`/exchanges/${req.params.id}`);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }
}

module.exports = new ExchangesController();