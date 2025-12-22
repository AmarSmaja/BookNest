const sellerBooksService = require("../services/SellerBooksService");

class SellerBooksController {
    async list(req, res) {
        const knjige = await sellerBooksService.listMyBooks(req.session.user, req.query);

        res.render("seller/books/list", {
            title: "Moje knjige",
            knjige,
            filters: {
                status: req.query.status || "ALL",
                sort: req.upit.sort || "newest",
            },
            error: null,
        });
    }

    async showCreate(req, res) {
        const lookups = await sellerBooksService.getCreateFormLookups();

        res.render("seller/books/new", {
            title: "Dodaj knjigu",
            lookups,
            error: null,
            values: {},
        });
    }

    async showEdit(req, res) {
        const data = await sellerBooksService.getEditData(req.session.user, req.params.id);
        if (!data) return res.status(404).send("Nije pronadjeno.");

        res.render("seller/books/edit", {
            title: "Uredi knjigu",
            lookups: data.lookups,
            error: null,
            values: data.knjiga,
            bookId: data.knjiga.id,
        });
    }

    async update(req, res) {
        try {
            await sellerBooksService.updateBook(req.session.user, req.params.id, req.body);
            return res.redirect("/seller/books");
        } catch (e) {
            const lookups = await sellerBooksService.getCreateFormLookups();
            return res.status(400).render("seller/books/edit", {
                title: "Uredi knjigu",
                lookups, 
                error: e.message,
                values: req.body,
                bookId: req.params.id,
            });
        }
    }

    async create(req, res) {
        try {
            await sellerBooksService.createBook(req.session.user, req.body);
            return res.redirect("/seller/books");
        } catch (e) {
            const lookups = await sellerBooksService.getCreateFormLookups();
            return res.status(400).render("seller/books/new", {
                title: "Dodaj knjigu",
                lookups,
                error: e.message,
                values: req.body,
            });
        }
    }
}

module.exports = new SellerBooksController();