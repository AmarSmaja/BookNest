const orderService = require("../services/OrderService");

class OrdersController {
    async checkout(req, res) {
        try {
            await orderService.checkoutFromCart(req.session.user);
            return res.redirect("/orders");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async myOrders(req, res) {
        const narudzbe = await orderService.listMyOrders(req.session.user.id);
        res.render("orders/list", { title: "Moje narudzbe", narudzbe });
    }
}

module.exports = new OrdersController();