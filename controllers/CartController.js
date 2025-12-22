const cartService = require("../services/CartService");

class CartController {
    async show(req, res) {
        const data = await cartService.viewCart(req.session.user);
        res.render("cart/index", { title: "Korpa", ...data, error: null });
    }

    async add(req, res) {
        try {
            await cartService.addToCart(req.session.user, req.body);
            return res.redirect("/cart");
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async remove(req, res) {
        await cartService.removeItem(req.session.user, req.body.cartItemId);
        return res.redirect("/cart");
    }
}

module.exports = new CartController();