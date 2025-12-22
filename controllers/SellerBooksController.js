const sellerBooksService = require("../services/SellerBooksService");

class SellerBooksController {
    async list(req, res) {
        const knjige = await sellerBooksService.listMyBooks(req.session.user, req.upit);

        res.render("seller/books/list", {
            title: "Moje knjige",
            knjige,
            filters: {
                status: req.upit.status || "ALL",
                sort: req.upit.sort || "newest",
            },
            error: null,
        });
    }

    async showCreate(req, res) {
        const lookups = await sellerBooksService.getCreateFormLookups();

        res.render("seller/books/new", {
            title: "Dodaj knjigu",
            ...lookups,
            error: null,
            values: {},
        });
    }

    async create(req, res) {
        try {
            await sellerBooksService.createBook(req.session.user, req.body);
            return res.redirect("/seller/books");
        } catch (e) {
            const lookups = await sellerBooksService.getCreateFormLookups();
            return res.status(400).render("seller/books/new", {
                title: "Dodaj knjigu",
                ...lookups,
                error: e.message,
                values: req.body,
            });
        }
    }
}

module.exports = new SellerBooksController();