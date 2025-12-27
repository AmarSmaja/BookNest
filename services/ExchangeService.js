const db = require("../models");
const exchangeDao = require("../dao/ExchangeDao");
const notificationDao = require("../dao/NotificationDao");

const STATUS = {
    NACEKANJU: "Na_cekanju",
    PRIHVACENA: "Prihvacena",
    ODBIJENA: "Odbijena",
    OTKAZANA: "Otkazana",
    ZAVRSENA: "Zavrsena",
};

function uniqueIntovi(arr) {
    const s = new Set();
    for (const x of arr || []) {
        const n = Number(x);
        if (Number.isFinite(n)) s.add(n);
    }

    return Array.from(s);
}

class ExchangeService {
    async izlistajMojeRazmjene(userId) {
        return exchangeDao.findBuyerList(userId);
    }

    async uzmiMojeDetalje(userId, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) return null;

        const ima = await exchangeDao.findOwnedByBuyer(id, userId);
        if (!ima) return null;

        return exchangeDao.getDetail(id);
    }

    async createExchangeFromBooks(user, requestedBookIds, offeredBookIds) {
        const requestedIds = uniqueIntovi(requestedBookIds);
        const offeredIds = uniqueIntovi(offeredBookIds);

        if (requestedIds.length === 0) throw new Error("Moras odabrati bar jednu trazenu knjigu!");
        if (offeredIds.length === 0) throw new Error("Moras odabrati bar jednu knjigu koju nudis!");

        return db.sequelize.transaction(async (t) => {
            const trazeneKnjige = await db.Book.findAll({
                where: { id: requestedIds },
                transaction: t,
            });

            if (trazeneKnjige.length !== requestedIds.length) throw new Error("Neka trazena knjiga ne postoji!");

            const sellerId = trazeneKnjige[0].prodavacId;
            if (!sellerId) throw new Error("Trazena knjiga nema prodavaca!");
            if (sellerId === user.id) throw new Error("Ne mozes traziti razmjenu za svoju knjigu!");

            for (const b of trazeneKnjige) {
                if (b.prodavacId !== sellerId) throw new Error(`Sve knjige moraju biti od istog prodavaca!`);
                if (b.status !== "Aktivna") throw new Error(`Knjiga ${b.naziv} nije dostupna!`);
                if (!b.spremnaZaRazmjenu) throw new Error(`Knjiga ${b.naziv} nije spremna za razmjenu!`);
            }

            const ponudjeneKnjige = await db.Book.findAll({
                where: { id: offeredIds, prodavacId: user.id },
                transaction: t,
            });

            if (ponudjeneKnjige.length !== offeredIds.length) throw new Error("Mozes nuditi samo svoje knjige koje ti pripadaju kao prodavacu!");

            for (const b of ponudjeneKnjige) {
                if (b.status !== "Aktivna") throw new Error(`Knjiga ${b.naziv} nije aktivna!`);
                if (!b.spremnaZaRazmjenu) throw new Error(`Knjiga ${b.naziv} nije spremna za razmjenu!`);
            }

            const zahtjevRazmjene = await exchangeDao.createRequest({ kupacId: user.id, prodavacId: sellerId, status: STATUS.NACEKANJU }, t );

            await exchangeDao.addRequested(zahtjevRazmjene.id, requestedIds, t);
            await exchangeDao.addOffered(zahtjevRazmjene.id, offeredIds, t);

            const allIds = [];
            for (let i = 0; i < requestedIds.length; i++) allIds.push(requestedIds[i]);
            for (let i = 0; i < offeredIds.length; i++) allIds.push(offeredIds[i]);

            const allBookIds = uniqueIntovi(allIds);

            await db.Book.update(
                { status: "Rezervisana" },
                { where: { id: allBookIds }, transaction: t }
            );

            await notificationDao.create({
                userId: sellerId,
                tip: "Nova_razmjena",
                payloadJson: {
                    exchangeId: zahtjevRazmjene.id,
                    kupacId: user.id,
                },
            }, t);

            return zahtjevRazmjene;
        });
    }

    async otkaziRazmjenu(user, exchangeId) {
        const id = Number(exchangeId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID razmjene!");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.findOwnedByBuyer(id, user.id);
            if (!razmjena) throw new Error("Razmjena nije pronadjena!");

            if (razmjena.status !== STATUS.NACEKANJU && razmjena.status !== STATUS.PRIHVACENA) {
                throw new Error("Razmjenu mozes otkazati samo ako je na cekanju ili ako je prihvacena!");
            }

            const detail = await exchangeDao.getDetail(id, t);
            
            let requestedRows = [];
            if (detail && Array.isArray(detail.requested)) {
                requestedRows = detail.requested;
            }

            let offeredRows = [];
            if (detail && Array.isArray(detail.offered)) {
                offeredRows = detail.offered;
            }

            const allIds = [];
            for (let i = 0; i < requestedRows.length; i++) {
                const r = requestedRows[i];
                if (r && r.bookId != null) allIds.push(r.bookId);
            }

            for (let i = 0; i < offeredRows.length; i++) {
                const r = offeredRows[i];
                if (r && r.bookId != null) allIds.push(r.bookId);
            }

            const uniqueBookIds = uniqueIntovi(allIds);

            if (uniqueBookIds.length > 0) {
                await db.Book.update(
                    { status: "Aktivna" },
                    { where: { id: uniqueBookIds }, transaction: t }
                );
            }

            await exchangeDao.updateStatus(id, STATUS.OTKAZANA, t);
            await exchangeDao.oznaciZavrseno(id, t);

            await notificationDao.create({
                userId: razmjena.prodavacId,
                tip: "Status_razmjene",
                payloadJson: { exchangeId: razmjena.id, status: STATUS.OTKAZANA },
            }, t);

            return true;
        })
    }
}

module.exports = new ExchangeService();