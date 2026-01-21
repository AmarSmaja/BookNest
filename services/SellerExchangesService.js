const db = require("../models");
const exchangeDao = require("../dao/ExchangeDao");
const notificationDao = require("../dao/NotificationDao");
const exchangeRequestDao = require("../dao/ExchangeRequestDao");
const bookDao = require("../dao/BookDao");

const DOPUSTENO = ["Na_cekanju", "Prihvacena", "Odbijena", "Otkazana", "Zavrsena"];
const NEDOPUSTENO = ["Odbijena", "Otkazana", "Zavrsena"];

const STATUS = {
    NA: "Na_cekanju",
    PRIH: "Prihvacena",
    ODB: "Odbijena",
    OTK: "Otkazana",
    ZAV: "Zavrsena",
};

function extractAllBookIds(detail) {
    const ids = [];
    const seen = new Set();

    if (detail && detail.requested) {
        for (const r of detail.requested) {
            if (!r) continue;
            const n = Number(r.bookId);
            if (!Number.isFinite(n)) continue;
            if (!seen.has(n)) { 
                seen.add(n); 
                ids.push(n); 
            }
        }
    }

    if (detail && detail.offered) {
        for (const r of detail.offered) {
            if (!r) continue;
            const n = Number(r.bookId);
            if (!Number.isFinite(n)) continue;
            if (!seen.has(n)) { 
                seen.add(n); 
                ids.push(n); 
            }
        }
    }

    return ids;
}

class SellerExchangesService {
    async izlistajMoje(user) {
        if (user.role === "Admin") {
            return exchangeRequestDao.findAll(null);
        }

        return exchangeDao.findSellerList(user.id);
    }

    async detailForSeller(user, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) return null;

        const ima = await exchangeDao.findOwnedBySeller(id, user.id);
        if (!ima) return null;

        const detail = await db.sequelize.transaction(async (t) => {
            return exchangeDao.getDetail(id, t);
        })

        return { razmjena: detail || ima };
    }

    async accept(user, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.findOwnedBySeller(id, user.id);
            if (!razmjena) throw new Error("Razmjena nije pronadjena!");
            if (razmjena.status !== STATUS.NA) throw new Error("Moze se prihvatiti samo ako je razmjena na cekanju!");

            await exchangeDao.updateStatus(razmjena.id, STATUS.PRIH, t);

            await notificationDao.create({ userId: razmjena.kupacId, tip: "Status_razmjene", payloadJson: { exchangeId: razmjena.id, status: STATUS.PRIH } }, t);

            return true;
        });
    }

    async reject(user, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.findOwnedBySeller(id, user.id);
            if (!razmjena) throw new Error("Razmjena nije pronadjena!");
            if (razmjena.status !== STATUS.NA && razmjena.status !== STATUS.PRIH) {
                throw new Error("Moze se odbiti samo ako je status razmjene na cekanju ili prihvacena!");
            }

            const detail = await exchangeDao.getDetail(razmjena.id, t);
            const allBookIds = extractAllBookIds(detail);

            await exchangeDao.updateStatus(razmjena.id, STATUS.ODB, t);
            await exchangeDao.oznaciZavrseno(razmjena.id, t);

            if (allBookIds.length > 0) await bookDao.updateStatusByIds(allBookIds, "Aktivna", t);

            await notificationDao.create({ userId: razmjena.kupacId, tip: "Status_razmjene", payloadJson: { exchangeId: razmjena.id, status: STATUS.ODB } }, t);

            return true;
        });
    }

    async complete(user, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.findOwnedBySeller(id, user.id);
            if (!razmjena) throw new Error("Razmjena nije pronadjena!");
            if (razmjena.status !== STATUS.PRIH) throw new Error("Moze se zavrsiti samo ako je prihvacena razmjena!");

            const detail = await exchangeDao.getDetail(razmjena.id, t);
            const allBookIds = extractAllBookIds(detail);
            
            await exchangeDao.updateStatus(razmjena.id, STATUS.ZAV, t);
            await exchangeDao.oznaciZavrseno(razmjena.id, t);

            if (allBookIds.length > 0) await bookDao.updateStatusByIds(allBookIds, "Prodana/Razmjenjena", t);

            await notificationDao.create({ userId: razmjena.kupacId, tip: "Status_razmjene", payloadJson: { exchangeId: razmjena.id, status: STATUS.ZAV } }, t);

            return true;
        });
    }

    async getDetail(user, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) return null;

        const ima = await exchangeDao.findOwnedBySeller(id, user.id);
        if (!ima) return null;

        return exchangeDao.getDetail(id);
    }

    async changeStatus(user, exchangeId, noviStatus) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID razmjene!");
        if (!user) throw new Error("Nisi logovan!");

        if (noviStatus == null) throw new Error("Status je obavezan!");
        noviStatus = String(noviStatus).trim();

        if (DOPUSTENO.indexOf(noviStatus) === -1) throw new Error("Nedopusten status!");

        let razmjena = null;

        if (user && user.role === "Admin") {
            razmjena = await exchangeDao.findById(id);
        } else {
            razmjena = await exchangeDao.findOwnedBySeller(id, user.id);
        }

        if (!razmjena) throw new Error("Razmjena nije pronadjena!");
        if (NEDOPUSTENO.indexOf(razmjena.status) !== -1) throw new Error("Ne mozes mijenjati status zavrsene narudzbe!");

        return db.sequelize.transaction(async (t) => {
            await exchangeDao.updateStatus(id, noviStatus, t);

            const bookIds = await exchangeDao.getAllBookIds(id, t);

            if (noviStatus === STATUS.ODB) {
                if (bookIds.length > 0) {
                    await bookDao.updateStatusByIds(bookIds, "Aktivna", t);
                }
                await exchangeDao.oznaciZavrseno(id, t);
            }
            
            if (noviStatus === STATUS.ZAV) {
                if (bookIds.length > 0) {
                    await bookDao.updateStatusByIds(bookIds, "Prodana/Razmjenjena", t);
                }
                await exchangeDao.oznaciZavrseno(id, t);
            }

            await notificationDao.create({ userId: razmjena.kupacId, tip: "Status_razmjene", payloadJson: { exchangeId: razmjena.id, status: noviStatus }, }, t);
            await notificationDao.create({ userId: razmjena.prodavacId, tip: "Status_razmjene", payloadJson: { exchangeId: razmjena.id, status: noviStatus }, }, t);

            return true;
        })
    }
}

module.exports = new SellerExchangesService();