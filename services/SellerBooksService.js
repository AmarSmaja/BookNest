const sellerBooksDao = require("../dao/SellerBooksDao");
const LookupDao = require("../dao/LookupDao");

class SellerBooksService {
    async listMyBooks(user, query) {
        return sellerBooksDao.listForSeller(user.id, {
            status: query.status || "ALL",
            sort: query.sort || "newest",
        });
    }

    async getCreateFormLookups() {
        return LookupDao.getBookFormLookups();
    }

    async createBook(user, body) {
        if (!body.naziv || body.naziv.trim().length < 2) throw new Error("Naziv je obavezan!");
        if (!body.autor || body.autor.trim().length < 2) throw new Error("Autor je obavezan!");
        if (!body.zanrId) throw new Error("Zanr je obavezan!");
        if (!body.jezikId) throw new Error("Jezik je obavezan!");
        if (!body.stanjeId) throw new Error("Stanje je obavezno!");
        if (body.cijena === undefined || body.cijena === null || body.cijena === "") throw new Error("Unesite cijenu!");

        const cijena = Number(body.cijena);
        if (!Number.isFinite(cijena) || cijena < 0) throw new Error("Cijena mora biti validan broj!");

        return sellerBooksDao.creteForSeller(user.id, {
            ...body,
            cijena,
            spremnaZaRazmjenu: body.spremnaZaRazmjenu === "on" || body.spremnaZaRazmjenu === true,
        });
    }

    async getEditData(user, id) {
        const bookId = Number(id);
        if (!Number.isFinite(bookId) || bookId <= 0) return null;

        const knjiga = await sellerBooksDao.findOwnedById(bookId, user.id);
        if (!knjiga) return null;

        const lookups = await LookupDao.getBookFormLookups();
        return { knjiga, lookups };
    }

    async updateBook(user, id, body) {
        const bookId = Number(id);
        if (!Number.isFinite(bookId) || bookId <= 0) throw new Error("Neispravan ID knjige!");

        if (!body.naziv || body.naziv.trim().length < 2) throw new Error("Autor je obavezan!");
        if (!body.autor || body.autor.trim().length < 2) throw new Error("Autor je obavezan!");
        if (!body.zanrId) throw new Error("Zanr je obavezan!");
        if (!body.jezikId) throw new Error("Jezik je obavezan!");
        if (!body.stanjeId) throw new Error("Stanje je obavezno!");
        if (body.cijena === undefined || body.cijena === null || body.cijena === "") throw new Error("Cijena mora biti validan broj!");

        const cijena = Number(body.cijena);
        if (!Number.isFinite(cijena) || cijena < 0) throw new Error("Cijena mora biti validan broj!");

        const updated = await sellerBooksDao.updateOwnedById(bookId, user.id, {
            ...body,
            cijena,
            spremnaZaRazmjenu: body.spremnaZaRazmjenu === "on" || body.spremnaZaRazmjenu === true,
        });

        if (!updated) throw new Error("Knjiga nije pronadjena ili nije tvoja.");
        return updated;
    }
}

module.exports = new SellerBooksService();