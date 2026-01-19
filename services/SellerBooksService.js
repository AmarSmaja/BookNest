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
        if (!body) throw new Error("Neispravni podaci!");

        if (body.zanrId === undefined || body.zanrId === null || body.zanrId === "") {
            if (body.genreId !== undefined && body.genreId !== null) body.zanrId = body.genreId;
        }
        if (body.jezikId === undefined || body.jezikId === null || body.jezikId === "") {
            if (body.languageId !== undefined && body.languageId !== null) body.jezikId = body.languageId;
        }
        if (body.stanjeId === undefined || body.stanjeId === null || body.stanjeId === "") {
            if (body.conditionId !== undefined && body.conditionId !== null) body.stanjeId = body.conditionId;
        }

        if (!body.naziv || body.naziv.trim().length < 2) throw new Error("Naziv je obavezan!");
        if (!body.autor || body.autor.trim().length < 2) throw new Error("Autor je obavezan!");
        if (!body.zanrId) throw new Error("Zanr je obavezan!");
        if (!body.jezikId) throw new Error("Jezik je obavezan!");
        if (!body.stanjeId) throw new Error("Stanje je obavezno!");
        if (body.cijena === undefined || body.cijena === null || body.cijena === "") throw new Error("Unesite cijenu!");

        const cijena = Number(body.cijena);
        if (!Number.isFinite(cijena) || cijena < 0) throw new Error("Cijena mora biti validan broj!");

        var payload = {};
        for (var k in body) payload[k] = body[k];

        payload.cijena = cijena;
        payload.spremnaZaRazmjenu = (body.spremnaZaRazmjenu === "on" || body.spremnaZaRazmjenu === true);

        payload.zanrId = Number(payload.zanrId);
        payload.jezikId = Number(payload.jezikId);
        payload.stanjeId = Number(payload.stanjeId);

        return sellerBooksDao.creteForSeller(user.id, payload);
    }

    async getEditData(user, id) {
        const bookId = Number(id);
        if (!Number.isFinite(bookId) || bookId <= 0) return null;

        const knjiga = await sellerBooksDao.findOwnedById(bookId, user.id);
        if (!knjiga) return null;

        if (knjiga.zanrId === undefined || knjiga.zanrId === null || knjiga.zanrId === "") {
            if (knjiga.genreId !== undefined && knjiga.genreId !== null) knjiga.zanrId = knjiga.genreId;
            else if (knjiga.genre_id !== undefined && knjiga.genre_id !== null) knjiga.zanrId = knjiga.genre_id;
        }

        if (knjiga.jezikId === undefined || knjiga.jezikId === null || knjiga.jezikId === "") {
            if (knjiga.languageId !== undefined && knjiga.languageId !== null) knjiga.jezikId = knjiga.languageId;
            else if (knjiga.language_id !== undefined && knjiga.language_id !== null) knjiga.jezikId = knjiga.language_id;
        }

        if (knjiga.stanjeId === undefined || knjiga.stanjeId === null || knjiga.stanjeId === "") {
            if (knjiga.conditionId !== undefined && knjiga.conditionId !== null) knjiga.stanjeId = knjiga.conditionId;
            else if (knjiga.condition_id !== undefined && knjiga.condition_id !== null) knjiga.stanjeId = knjiga.condition_id;
        }

        const lookups = await LookupDao.getBookFormLookups();
        return { knjiga: knjiga, lookups: lookups };
    }

    async updateBook(user, id, body) {
        const bookId = Number(id);
        if (!Number.isFinite(bookId) || bookId <= 0) throw new Error("Neispravan ID knjige!");

        if (!body.zanrId) throw new Error("Zanr je obavezan!");
        if (!body.jezikId) throw new Error("Jezik je obavezan!");
        if (!body.stanjeId) throw new Error("Stanje je obavezno!");

        const cijena = Number(body.cijena);
        if (!Number.isFinite(cijena) || cijena < 0) throw new Error("Cijena mora biti validan broj!");

        const qty = Number(body.kolicinaDostupno);
        if (!Number.isFinite(qty) || qty < 0) throw new Error("Količina mora biti broj >= 0.");

        const updated = await sellerBooksDao.updateOwnedById(bookId, user.id, {
            naziv: body.naziv,
            autor: body.autor,
            izdavac: body.izdavac || null,
            godinaIzdavanja: body.godinaIzdavanja || null,
            opis: body.opis || null,
            zanrId: body.zanrId,
            jezikId: body.jezikId,
            stanjeId: body.stanjeId,
            cijena,
            glavnaSlikaUrl: body.glavnaSlikaUrl || null,
            spremnaZaRazmjenu: body.spremnaZaRazmjenu === "on" || body.spremnaZaRazmjenu === true,
            status: body.status,
            kolicinaDostupno: qty,
        });

        if (!updated) throw new Error("Knjiga nije pronadjena ili nije tvoja.");
        return updated;
    }
}

module.exports = new SellerBooksService();