const db = require("../models");
const exchangeDao = require("../dao/ExchangeDao");
const notificationDao = require("../dao/NotificationDao");
const bookDao = require("../dao/BookDao");

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

        const requestedBook = await bookDao.findById(bookId);
        if (!requestedBook) throw new Error("Knjiga nije pronadjena!");

        if (requestedBook.status !== "Aktivna") throw new Error("Knjiga nije aktivna!");
        if (Number(requestedBook.prodavacId) === Number(user.id)) throw new Error("Ne mozes razmjenjivati svoju knjigu!");

        const spremna = (requestedBook.spremnaZaRazmjenu == true || requestedBook.spremnaZaRazmjenu == "1" || requestedBook.spremnaZaRazmjenu == "true");
        if (!spremna) throw new Error("Ova knjiga nije dostupna za razmjenu!");

        const myBooks = await bookDao.findActiveBySeller(user.id);
        return { requestedBook, myBooks };
    }

    async createFromForm(user, body) {
        if (!user || !user.id) throw new Error("Nisi logovan!");

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

        const offeredIds = uniqueIntovi(offered);
        if (offered.length === 0) throw new Error("Moras izabrati bar jednu knjigu da ponudis!");

        return db.sequelize.transaction(async (t) => {
            const requestedBook = await bookDao.findById(requestedBookId, t);
            if (!requestedBook) throw new Error("Trazena knjiga ne postoji!");
            if (requestedBook.status !== "Aktivna") throw new Error("Knjiga nije aktivna!");

            const spremna = (requestedBook.spremnaZaRazmjenu == true || requestedBook.spremnaZaRazmjenu == "1" || requestedBook.spremnaZaRazmjenu == "true");
            if (!spremna) throw new Error("Knjiga nije spremna za razmjenu!");

            if (Number(requestedBook.prodavacId) === Number(user.id)) throw new Error("Ne mozes razmjeniti svoje knjige!");

            const myOffered = await bookDao.findActiveByIdsAndSeller(offeredIds, user.id, t);
            if (!myOffered || myOffered.length !== offeredIds.length) throw new Error("Jedna ili vise knjiga nisu tvoje ili nisu aktivne!");

            const razmjena = await exchangeDao.createRequest({ kupacId: user.id, prodavacId: requestedBook.prodavacId, status: STATUS.NACEKANJU, zavrsenaAt: null }, t);

            await exchangeDao.addRequested(razmjena.id, [requestedBookId], t);
            await exchangeDao.addOffered(razmjena.id, offered, t);

            const idsZaRezerivsanje = uniqueIntovi([requestedBookId].concat(offeredIds));
            if (idsZaRezerivsanje > 0) await bookDao.updateStatusByIds(idsZaRezerivsanje, "Rezervisana", t);

            await notificationDao.create({ userId: requestedBook.prodavacId, tip: "Nova_razmjena", payloadJson: { exchangeId: razmjena.id, buyerId: user.id } }, t);
            await notificationDao.create({ userId: user.id, tip: "Nova_razmjena", payloadJson: { exchangeId: razmjena.id, sellerId: requestedBook.prodavacId } }, t);

            return razmjena;
        });
    }

    async createExchangeFromBooks(user, requestedBookIds, offeredBookIds) {
        if (!user || !user.id) throw new Error("Nisi logovan!");

        const reqIds = uniqueIntovi(Array.isArray(requestedBookIds) ? requestedBookIds : [requestedBookIds]);
        const offIds = uniqueIntovi(Array.isArray(offeredBookIds) ? offeredBookIds : [offeredBookIds]);

        if (reqIds.length === 0) throw new Error("Nisi stavio trazenu knjigu!");
        if (offIds.length === 0) throw new Error("Moras odabrati bar jednu knjigu koju nudis!");

        const trazene = await bookDao.findAllByIds(reqIds);
        if (!trazene || trazene.length === 0) throw new Error("Trazena knjiga ne postoji!");
        if (trazene.length !== reqIds.length) throw new Error("Jedna ili vise knjiga ne postoji!"); 

        let sellerId = null;

        for (let i = 0; i < trazene.length; i++) {
            const bk = trazene[i];
            if (!bk) throw new Error("Neispravna trazenja knjiga");
            if (bk.prodavacId === null) throw new Error("Trazena knjiga nema prodavaca!");
            if (Number(bk.prodavacId) === Number(user.id)) throw new Error("Ne mozes traziti vlastitu knjigu!");
            if (bk.status !== "Aktivna") throw new Error("Trazena knjiga nije aktivna!");

            if (sellerId == null) sellerId = Number(bk.prodavacId);
            else if (Number(bk.prodavacId) !== Number(sellerId)) throw new Error("Sve trazene knjige moraju biti od istog prodavaca!");
        }

        if (!Number.isFinite(sellerId) || sellerId <= 0) throw new Error("Ne moze se odrediti prodavac za trazene knjige!");

        const ponudjene = await bookDao.findActiveByIdsAndSeller(offIds, user.id);
        if (!ponudjene || ponudjene.length === 0) throw new Error("Nemas validnih knjiga za ponuditi!");
        if (ponudjene.length !== offIds.length) throw new Error("Jedna ili vise ponudjenih knjiga nije tvoja ili ne postoji!");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.createRequest({ kupacId: user.id, prodavacId: sellerId, status: STATUS.NACEKANJU, zavrsenaAt: null }, t);

            await exchangeDao.addRequested(razmjena.id, reqIds, t);
            await exchangeDao.addOffered(razmjena.id, offIds, t);

            const allIds = uniqueIntovi(reqIds.concat(offIds));
            if (allIds.length > 0) await bookDao.updateStatusByIds(allIds, "Rezervisana", t);

            await notificationDao.create({ userId: sellerId, tip: "Nova_razmjena", payloadJson: { exchangeId: razmjena.id, buyerId: user.id } }, t);
            await notificationDao.create({ userId: user.id, tip: "Nova_razmjena", payloadJson: { exchangeId: razmjena.id, sellerId: sellerId } }, t);

            return razmjena;
        });
    }

    async otkaziRazmjenu(user, exchangeId) {
        if (!user || !user.id) throw new Error("Nisi logovan!");

        const id = Number(exchangeId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID razmjene!");

        return db.sequelize.transaction(async (t) => {
            const razmjena = await exchangeDao.findOwnedByBuyer(id, user.id);
            if (!razmjena) throw new Error("Razmjena nije pronadjena!");

            if (razmjena.status !== STATUS.NACEKANJU && razmjena.status !== STATUS.PRIHVACENA) {
                throw new Error("Razmjenu mozes otkazati samo ako je na cekanju ili ako je prihvacena!");
            }
            
            const requestedRows = await exchangeDao.listRequestedBookIds(id, t);
            const offeredRows = await exchangeDao.listRequestedBookIds(id, t);

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

            if (uniqueBookIds.length > 0) await bookDao.updateStatusByIds(uniqueBookIds, "Aktivna", t);

            await exchangeDao.updateStatus(id, STATUS.OTKAZANA, t);
            await exchangeDao.oznaciZavrseno(id, t);

            await notificationDao.create({ userId: razmjena.prodavacId, tip: "Status_razmjene", payloadJson: { exchangeId: razmjena.id, status: STATUS.OTKAZANA } }, t);

            return true;
        });
    }
}

module.exports = new ExchangeService();