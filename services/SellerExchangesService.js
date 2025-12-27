const db = require("../models");
const exchangeDao = require("../dao/ExchangeDao");
const notificationDao = require("../dao/NotificationDao");

const DOPUSTENO = ["Na_cekanju", "Prihvacena", "Odbijena", "Otkazana", "Zavrsena"];
const NEDOPUSTENO = ["Odbijena", "Otkazana", "Zavrsena"];

function dozvoljenPrijelaz(from, to) {
    if (!DOPUSTENO.includes(to)) return false;
    if (NEDOPUSTENO.includes(from)) return false;

    if (from === "Na_cekanju" && (to === "Prihvacena" || to === "Odbijena")) return true;
    if (from === "Prihvacena" && (to === "Zavrsena" || to === "Odbijena")) return true;

    return false;
}

function uniqueIntovi(arr) {
    const s = new Set();
    for (const x of arr || []) {
        const n = Number(x);
        if (Number.isFinite(n)) s.add(n);
    }
    return Array.from(s);
}

class SellerExchangesService {
    async izlistajMoje(user) {
        return exchangeDao.findSellerList(user.id);
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

        if (!DOPUSTENO.includes(noviStatus)) throw new Error("Neispravan status!");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.findOwnedBySeller(id, user.id);
            if (!razmjena) throw new Error("Razmjena nije pronadjena!");

            if (!dozvoljenPrijelaz(razmjena.status, noviStatus)) {
                throw new Error(`Nije dozovljeno ${razmjena.status} -> ${noviStatus}`);
            }

            const detail = await exchangeDao.getDetail(id, t);
            const requestedIds = (detail.requested || []).map((x) => x.bookId).filter((x) => x != null);
            const offeredIds = (detail.offered || []).map((x) => x.bookId).filter((x) => x != null);
            const allIds = uniqueIntovi([...requestedIds, ...offeredIds]);

            await exchangeDao.updateStatus(id, noviStatus, t);

            await notificationDao.create({
                userId: razmjena.kupacId,
                tip: "Status_razmjene",
                payloadJson: { exchangeId: razmjena.id, status: noviStatus },
            }, t);

            if (noviStatus === "Odbijena") {
                await exchangeDao.oznaciZavrseno(id, t);

                if (allIds.length) {
                    await db.Book.update(
                        { status: "Aktivna" },
                        { where: { id: allIds }, transaction: t }
                    );
                }
            }

            if (noviStatus === "Zavrsena") {
                await exchangeDao.oznaciZavrseno(id, t);

                if (allIds.length) {
                    await db.Book.update(
                        { status: "Prodana/Razmjenjena" },
                        { where: { id: allIds }, transaction: t }
                    );
                }
            }

            return true;
        })
    }
}

module.exports = new SellerExchangesService();