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

    async showCreate(req, res) {
        try {
            const data = await exchangeService.getCreateData(req.session.user, req.query.bookId);

            return res.render("exchanges/new", {
                title: "Predlozi razmjenu",
                requestedBook: data.requestedBook,
                myBooks: data.myBooks,
                error: null,
                values: {},
            });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async create(req, res) {
        try {
            console.log("BODY: ", req.body);

            const requestedRaw = req.body.requestedBookIds;
            const offeredRaw = req.body.offeredBookIds || req.body["offeredBookIds[]"];

            const requestedBookIds = [];
            if (Array.isArray(requestedRaw)) {
                for (const v of requestedRaw) {
                    const n = Number(v);
                    if (!isNaN(n)) requestedBookIds.push(n);
                }
            } else {
                const n = Number(requestedRaw);
                if (!isNaN(n)) requestedBookIds.push(n);
            }

            const offeredBookIds = [];
            if (Array.isArray(offeredRaw)) {
                for (const v of offeredRaw) {
                    const n = Number(v);
                    if (!isNaN(n)) offeredBookIds.push(n);
                }
            } else {
                const n = Number(offeredRaw);
                if (!isNaN(n)) offeredBookIds.push(n);
            }

            if (offeredBookIds.length === 0) {
                throw new Error("Moras odabrati bar jednu knjigu koju nudis!");
            }

            const razmjena = await exchangeService.createExchangeFromBooks(
                req.session.user,
                requestedBookIds,
                offeredBookIds
            );

            return res.redirect(`/exchanges/${razmjena.id}`);
        } catch (e) {
            try {
                const data = await exchangeService.getCreateData(req.session.user, req.body.requestedBookIds);
                return res.status(400).render("exchanges/new", {
                    title: "Predlozi razmjenu",
                    requestedBook: data.requestedBook,
                    myBooks: data.myBooks,
                    error: e.message,
                    values: req.body,
                });
            } catch (e2) {
                return res.status(400).send(e.message);
            }
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