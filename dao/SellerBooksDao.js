const db = require("../models");

class SellerBooksDao {
    async listForSeller(sellerId, { status, sort = "newest" } = {}) {
        const where = { prodavacId: sellerId };
        if (status && status !== "ALL") where.status = status;

        const order = 
            sort === "price_asc" ? [["cijena", "ASC"]] :
            sort === "price_desc" ? [["cijena", "DESC"]] :
            sort === "name_asc" ? [["naziv", "ASC"]] :
            [["created_at", "DESC"]];

        return db.Book.findAll({ where, order, });
    }

    async creteForSeller(sellerId, payload) {
        return db.Book.create({
            prodavacId: sellerId,
            naziv: payload.naziv,
            autor: payload.autor,
            izdavac: payload.izdavac || null,
            godinaIzdavanja: payload.godinaIzdavanja ? Number(payload.godinaIzdavanja) : null,
            opis: payload.opis || null,
            zanrId: Number(payload.zanrId),
            jezikId: Number(payload.jezikId),
            stanjeId: Number(payload.stanjeId),
            cijena: payload.cijena,
            spremnaZaRazmjenu: !!payload.spremnaZaRazmjenu,
            glavnaSlikaUrl: payload.glavnaSlikaUrl || null,
            status: payload.status || "Aktivna",
            kolicinaDostupno: payload.kolicinaDostupno != null ? Number(payload.kolicinaDostupno) : 1,
        });
    }

    async updateOwnedById(bookId, sellerId, payload) {
        const knjiga = await this.findOwnedById(bookId, sellerId);
        if (!knjiga) return null;

        await knjiga.update({
            naziv: payload.naziv,
            autor: payload.autor,
            izdavac: payload.izdavac || null,
            godinaIzdavanja: payload.godinaIzdavanja ? Number(payload.godinaIzdavanja) : null,
            opis: payload.opis || null,
            zanrId: Number(payload.zanrId),
            jezikId: Number(payload.jezikId),
            stanjeId: Number(payload.stanjeId),
            cijena: payload.cijena,
            spremnaZaRazmjenu: !!payload.spremnaZaRazmjenu,
            glavnaSlikaUrl: payload.glavnaSlikaUrl || null,
            status: payload.status || knjiga.status,
            kolicinaDostupno: payload.kolicinaDostupno != null ? Number(payload.kolicinaDostupno) : 1,
        });

        return knjiga;
    }

    async findOwnedById(bookId, sellerId) {
        return db.Book.findOne({ where: { id: bookId, prodavacId: sellerId }, });
    }
}

module.exports = new SellerBooksDao();