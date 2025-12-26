const orderService = require("../services/OrderService");

class OrdersController {
    async checkout(req, res) {
        try {
            await orderService.checkoutFromCart(req.session.user);
            return res.redirect("/orders");
        } catch (e) {
            console.error("CHECKOUT ERROR:", e);
            return res.status(400).send(e.message);
        }
    }

    async myOrders(req, res) {
        const narudzbe = await orderService.listMyOrders(req.session.user.id);
        res.render("orders/list", { title: "Moje narudzbe", narudzbe });
    }

    async detail(req, res) {
        const data = await orderService.uzmiDetaljeNarudzbe(req.session.user.id, req.params.id);
        if (!data || !data.narudzba) return res.status(404).send("Narudzba nije pronadjena!");

        return res.render("orders/detail", {
            title: `Narudzba ${data.narudzba.id}`,
            narudzba: data.narudzba,
            items: data.items,
            error: null,
        });
    }
}

module.exports = new OrdersController();