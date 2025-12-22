const sellerBooksDao = require("../dao/SellerBooksDao");
const LookupDao = require("../dao/LookupDao");

class SellerBooksService {
    async listMyBooks(user, upit) {
        return sellerBooksDao.listForSeller(user.id, {
            status: upit.status || "ALL",
            sort: upit.sort || "newest",
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
}

module.exports = new SellerBooksService();