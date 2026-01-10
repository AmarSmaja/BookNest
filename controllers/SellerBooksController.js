const sellerBooksService = require("../services/SellerBooksService");

class SellerBooksController {
    async list(req, res) {
        const knjige = await sellerBooksService.listMyBooks(req.session.user, req.query);

        res.render("books/list", {
            title: "Moje knjige",
            knjige,
            filters: {
                status: req.query.status || "ALL",
                sort: req.query.sort || "newest",
            },
            error: null,
        });
    }

    async showCreate(req, res) {
        const lookups = await sellerBooksService.getCreateFormLookups();

        res.render("books/new", {
            title: "Dodaj knjigu",
            lookups,
            error: null,
            values: {},
        });
    }

    async showEdit(req, res) {
        const data = await sellerBooksService.getEditData(req.session.user, req.params.id);
        if (!data) return res.status(404).send("Nije pronadjeno.");

        res.render("books/edit", {
            title: "Uredi knjigu",
            lookups: data.lookups,
            error: null,
            values: data.knjiga,
            bookId: data.knjiga.id,
        });
    }

    async update(req, res) {
        try {
            let kolicinaDostupno = 1;

            if (req.body && req.body.kolicinaDostupno != null) {
                const n = Number(req.body.kolicinaDostupno);
                if (Number.isFinite(n) && n >= 0) kolicinaDostupno = n; 
            }

            await sellerBooksService.updateBook(req.session.user, req.params.id, req.body);
            return res.redirect("/seller/books");
        } catch (e) {
            const lookups = await sellerBooksService.getCreateFormLookups();
            return res.status(400).render("books/edit", {
                title: "Uredi knjigu",
                lookups, 
                error: e.message,
                values: req.body,
                bookId: req.params.id,
                kolicinaDostupno: kolicinaDostupno,
            });
        }
    }

    async create(req, res) {
        try {
            let kolicinaDostupno = 1;

            if (req.body && req.body.kolicinaDostupno != null) {
                const n = Number(req.body.kolicinaDostupno);
                if (Number.isFinite(n) && n >= 0) kolicinaDostupno = n; 
            }

            await sellerBooksService.createBook(req.session.user, req.body);
            return res.redirect("/seller/books");
        } catch (e) {
            const lookups = await sellerBooksService.getCreateFormLookups();
            return res.status(400).render("books/new", {
                title: "Dodaj knjigu",
                lookups,
                kolicinaDostupno: kolicinaDostupno,
                error: e.message,
                values: req.body,
            });
        }
    }
}

module.exports = new SellerBooksController();