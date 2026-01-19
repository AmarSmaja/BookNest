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

    async getCreateData(user, bookIdRaw) {
        const bookId = Number(bookIdRaw);
        if (!Number.isFinite(bookId)) throw new Error("Knjiga nije pronadjena!");

        const requestedBook = await db.Book.findByPk(bookId);
        if (!requestedBook) throw new Error("Knjiga nije pronadjena!");

        if (requestedBook.status !== "Aktivna") throw new Error("Knjiga nije aktivna!");
        if (Number(requestedBook.prodavacId) === Number(user.id)) throw new Error("Ne mozes razmjenjivati svoju knjigu!");

        if (requestedBook.spremnaZaRazmjenu !== true) throw new Error("Ova knjiga nije dostupna za razmjenu!");

        const myBooks = await db.Book.findAll({
            where: { prodavacId: user.id, status: "Aktivna" },
            order: [["id", "DESC"]],
        });

        return { requestedBook, myBooks };
    }

    async createFromForm(user, body) {
        const requestedBookId = Number(body.requestedBookId);
        if (!Number.isFinite(requestedBookId)) throw new Error("Neispravan ID trazene knjige!");

        const offered = [];
        if (Array.isArray(body.offeredBookIds)) {
            for (const x of body.offeredBookIds) {
                const n = Number(x);
                if (Number.isFinite(n)) offered.push(n);
            }
        } else if (body.offeredBookIds != null) {
            const n = Number(body.offeredBookIds);
            if (Number.isFinite(n)) offered.push(n)
        }

        if (offered.length === 0) throw new Error("Moras izabrati bar jednu knjigu da ponudis!");

        return db.sequelize.transaction(async (t) => {
            const requestedBook = await db.Book.findByPk(requestedBookId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!requestedBook) throw new Error("Trazena knjiga ne postoji!");
            if (requestedBook.status !== "Aktivna") throw new Error("Knjiga nije aktivna");
            if (requestedBook.spremnaZaRazmjenu !== true) throw new Error("Knjiga nije spremna za razmjenu!");
            if (Number(requestedBook.prodavacId) === Number(user.id)) throw new Error("Ne mozes razmjeniti svoje knjige!");

            const myOffered = await db.Book.findAll({
                where: { id: offered, prodavacId: user.id, status: "Aktivna" },
                transaction: t,
            });

            if (myOffered.length !== offered.length) {
                throw new Error("Jedna ili vise ponudjenih knjiga nisu aktivne ili nisu tvoje!");
            }

            const razmjena = await exchangeDao.createRequest({
                kupacId: user.id,
                prodavacId: requestedBook.prodavacId,
                status: "Na_cekanju",
            }, t);

            await exchangeDao.addRequested(razmjena.id, [requestedBookId], t);
            await exchangeDao.addOffered(razmjena.id, offered, t);

            const idZaRezervisanje = [];
            idZaRezervisanje.push(requestedBookId);

            for (let i = 0; i < offered.length; i++) {
                idZaRezervisanje.push(offered[i]);
            }

            await db.Book.update(
                { status: "Rezervisana" },
                { where: { id: idZaRezervisanje }, transaction: t }
            );

            return razmjena;
        })
    }

    // async createExchangeFromBooks(user, requestedBookIds, offeredBookIds) {
    //     const requestedIds = uniqueIntovi(requestedBookIds);
    //     const offeredIds = uniqueIntovi(offeredBookIds);

    //     if (requestedIds.length === 0) throw new Error("Moras odabrati bar jednu trazenu knjigu!");
    //     if (offeredIds.length === 0) throw new Error("Moras odabrati bar jednu knjigu koju nudis!");

    //     return db.sequelize.transaction(async (t) => {
    //         const trazeneKnjige = await db.Book.findAll({
    //             where: { id: requestedIds },
    //             transaction: t,
    //         });

    //         if (trazeneKnjige.length !== requestedIds.length) throw new Error("Neka trazena knjiga ne postoji!");

    //         const sellerId = trazeneKnjige[0].prodavacId;
    //         if (!sellerId) throw new Error("Trazena knjiga nema prodavaca!");
    //         if (sellerId === user.id) throw new Error("Ne mozes traziti razmjenu za svoju knjigu!");

    //         for (const b of trazeneKnjige) {
    //             if (b.prodavacId !== sellerId) throw new Error(`Sve knjige moraju biti od istog prodavaca!`);
    //             if (b.status !== "Aktivna") throw new Error(`Knjiga ${b.naziv} nije dostupna!`);
    //             if (!b.spremnaZaRazmjenu) throw new Error(`Knjiga ${b.naziv} nije spremna za razmjenu!`);
    //         }

    //         const ponudjeneKnjige = await db.Book.findAll({
    //             where: { id: offeredIds, prodavacId: user.id },
    //             transaction: t,
    //         });

    //         if (ponudjeneKnjige.length !== offeredIds.length) throw new Error("Mozes nuditi samo svoje knjige koje ti pripadaju kao prodavacu!");

    //         for (const b of ponudjeneKnjige) {
    //             if (b.status !== "Aktivna") throw new Error(`Knjiga ${b.naziv} nije aktivna!`);
    //             if (!b.spremnaZaRazmjenu) throw new Error(`Knjiga ${b.naziv} nije spremna za razmjenu!`);
    //         }

    //         const zahtjevRazmjene = await exchangeDao.createRequest({ kupacId: user.id, prodavacId: sellerId, status: STATUS.NACEKANJU }, t );

    //         await exchangeDao.addRequested(zahtjevRazmjene.id, requestedIds, t);
    //         await exchangeDao.addOffered(zahtjevRazmjene.id, offeredIds, t);

    //         const allIds = [];
    //         for (let i = 0; i < requestedIds.length; i++) allIds.push(requestedIds[i]);
    //         for (let i = 0; i < offeredIds.length; i++) allIds.push(offeredIds[i]);

    //         const allBookIds = uniqueIntovi(allIds);

    //         await db.Book.update(
    //             { status: "Rezervisana" },
    //             { where: { id: allBookIds }, transaction: t }
    //         );

    //         await notificationDao.create({
    //             userId: sellerId,
    //             tip: "Nova_razmjena",
    //             payloadJson: {
    //                 exchangeId: zahtjevRazmjene.id,
    //                 kupacId: user.id,
    //             },
    //         }, t);

    //         return zahtjevRazmjene;
    //     });
    // }

    async createExchangeFromBooks(user, requestedBookIds, offeredBookIds) {
        if (!user || !user.id) throw new Error("Nisi logovan!");
        
        var reqIds = [];
        if (Array.isArray(requestedBookIds)) {
            for (let i = 0; i < requestedBookIds.length; i++) {
                let n = Number(requestedBookIds[i]);
                if (!isNaN(n) && n > 0) reqIds.push(n);
            }
        } else {
            let n1 = Number(requestedBookIds);
            if (!isNaN(n1) && n1 > 0) reqIds.push(n1);
        }

        let offIds = [];
        if (Array.isArray(offeredBookIds)) {
            for (let j = 0; j < offeredBookIds.length; j++) {
                let m = Number(offeredBookIds[j]);
                if (!isNaN(m) && m > 0) offIds.push(m);
            }
        } else {
            let m1 = Number(offeredBookIds);
            if (!isNaN(m1) && m1 > 0) offIds.push(m1);
        }

        if (reqIds.length === 0) throw new Error("Nisi stavio trazenu knjigu!");
        if (offIds.length === 0) throw new Error("Moras odabrati bar jednu knjigu koju nudis!");

        let trazene = await db.Book.findAll({ where: { id: reqIds } });
        if (!trazene || trazene.length === 0) throw new Error("Trazena knjiga ne postoji!");
        if (trazene.length !== reqIds.length) throw new Error("Jedna ili vise trazenih knjiga ne postoji!");
        
        let sellerId = null;

        for (let a = 0; a < trazene.length; a++) {
            let bk = trazene[a];

            if (!bk) throw new Error("Neispravna trazena knjiga!");
            if (bk.prodavacId == null) throw new Error("Trazena knjiga nema prodavaca!");

            if (Number(bk.prodavacId) === Number(user.id)) throw new Error("Ne mozes traziti vlastitu knjigu!");
            if (bk.status !== "Aktivna") throw new Error("Trazena knjiga nije aktivna!");

            if (sellerId == null) {
                sellerId = Number(bk.prodavacId);
            } else {
                if (Number(bk.prodavacId) !== Number(sellerId)) {
                    throw new Error("Sve trazene knjige moraju biti od istog prodavaca!");
                }
            }
        }

        if (!Number.isFinite(sellerId) || sellerId <= 0) throw new Error("Ne moze se odrediti prodavac za trazene knjige!");

        let ponudjene = await db.Book.findAll({ where: { id: offIds, prodavacId: user.id } });

        if (!ponudjene || ponudjene.length === 0) throw new Error("Nemas validnih knjiga za ponuditi!");
        if (ponudjene.length !== offIds.length) throw new Error("Jedna ili vise ponudjenih knjiga nije tvoja ili ne postoji!");
        
        for (let b = 0; b < ponudjene.length; b++) {
            let ob = ponudjene[b];
            if (!ob) throw new Error("Neispravna ponudjena knjiga!");
            if (ob.status !== "Aktivna") throw new Error("Ponudjena knjiga mora biti aktivna!");
        }

        return db.sequelize.transaction(async (t) => {
            let razmjena = await exchangeDao.createRequest({ kupacId: user.id, prodavacId: sellerId, status: "Na_cekanju", zavrsenaAt: null }, t);

            await exchangeDao.addRequested(razmjena.id, reqIds, t);
            await exchangeDao.addOffered(razmjena.id, offIds, t);

            let allIds = [];
            for (let x = 0; x < reqIds.length; x++) allIds.push(reqIds[x]);
            for (let y = 0; y < offIds.length; y++) allIds.push(offIds[y]);

            if (allIds.length > 0) {
                await db.Book.update(
                    { status: "Rezervisana" },
                    { where: { id: allIds }, transaction: t }
                );
            }

            await notificationDao.create({ userId: sellerId, tip: "Nova_razmjena", payloadJson: { exchangeId: razmjena.id, buyerId: user.id } }, t);
            await notificationDao.create({ userId: user.id, tip: "Nova_razmjena", payloadJson: { exchangeId: razmjena.id, sellerId: sellerId } }, t);

            return razmjena;
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

            const requestedRows = await db.ExchangeRequestedBook.findAll({
                where: { exchangeId: id },
                attributes: ["bookId"],
                raw: true,
                transaction: t,
            });

            const offeredRows = await db.ExchangeOfferedBook.findAll({
                where: { exchangeId: id },
                attributes: ["bookId"],
                raw: true,
                transaction: t,
            });

            const allIds = [];
            for (let i = 0; i < requestedRows.length; i++) {
                const v = Number(requestedRows[i].bookId);
                if (Number.isFinite(v)) allIds.push(v);
            }

            for (let i = 0; i < offeredRows.length; i++) {
                const v = Number(offeredRows[i].bookId);
                if (Number.isFinite(v)) allIds.push(v);
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
        });
    }
}

module.exports = new ExchangeService();