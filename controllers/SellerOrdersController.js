const SellerOrdersService = require("../services/SellerOrdersService");

class SellerOrdersController {
    async list(req, res) {
        const narudzbe = await SellerOrdersService.listMyOrders(req.session.user);
        res.render("seller/orders/list", { title: "Narudzba", narudzbe, error: null });
    }

    async detail(req, res) {
        const data = await SellerOrdersService.getDetail(req.session.user, req.params.id);
        if (!data) return res.status(404).send("Nije pronadjeno!");

        res.render("seller/orders/detail", {
            title: `Narudzba #${data.order.id}`,
            order: data.order,
            items: data.items,
            error: null,
        });
    }

    async changeStatus(req, res) {
        try {
            await SellerOrdersService.changeStatus(req.session.user, req.params.id, req.body.status);
            return res.redirect(`/seller/orders/${req.params.id}`);
        } catch (e) {
            const data = await SellerOrdersService.getDetail(req.session.user, req.params.id);
            if (!data) return res.status(404).send("Nije pronadjeno!");

            return res.status(400).render("seller/orders/detail", {
                title: `Narudzba #${data.order.id}`,
                order: data.order,
                items: data.items,
                error: e.message,
            });
        }
    }
}

module.exports = new SellerOrdersController();