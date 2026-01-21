    const db = require("../models");
    const cartDao = require("../dao/CartDao");
    const notificationDao = require("../dao/NotificationDao");
    const bookDao = require("../dao/BookDao");
    const orderDao = require("../dao/OrderDao");

    class OrderService {
    async checkoutFromCart(user) {
        if (!user || !user.id) throw new Error("Nisi logovan!");

        const sequelize = db.sequelize;
        if (!sequelize) throw new Error("Error sa sequelizeom!");

        return sequelize.transaction(async (t) => {
        const rezultat = await cartDao.getCartView(user.id, t);
        const items = rezultat && rezultat.items ? rezultat.items : [];

        var rows = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i] && items[i].book) rows.push(items[i]);
        }

        if (rows.length === 0) throw new Error("Korpa je prazna!");

        let poSelleru = {};
        let sellerIds = [];

        for (let rIndex = 0; rIndex < rows.length; rIndex++) {
            let r = rows[rIndex];

            let qty = Number(r.kolicina);
            if (!Number.isFinite(qty) || qty <= 0) qty = 1;

            const bookId = r.book.id;
            const knjiga = await bookDao.findByIdForUpdate(bookId, t);

            if (!knjiga) throw new Error("Jedna od knjiga vise ne postoji!");
            if (knjiga.status !== "Aktivna") throw new Error("Jedna od knjiga vise nije dostupna!");
            if (Number(knjiga.prodavacId) === Number(user.id)) throw new Error("Ne mozes kupiti svoju knjigu!");

            let stanje = Number(knjiga.kolicinaDostupno);
            if (!Number.isFinite(stanje)) stanje = 0;

            if (stanje < qty) throw new Error("Nema dovoljno primjeraka te knjige na stanju!");

            let novoStanje = stanje - qty;
            let noviStatus = "Aktivna";
            if (novoStanje === 0) noviStatus = "Rezervisana";

            await bookDao.updateInstance(knjiga, { kolicinaDostupno: novoStanje, status: noviStatus }, t);

            let sellerKey = String(knjiga.prodavacId);
            if (!poSelleru[sellerKey]) {
            poSelleru[sellerKey] = [];
            sellerIds.push(knjiga.prodavacId);
            }

            poSelleru[sellerKey].push({ book: knjiga, qty: qty });
        }

        let napravljeniOrderi = [];

        for (let s = 0; s < sellerIds.length; s++) {
            let sellerId = sellerIds[s];
            let key = String(sellerId);
            let sellerRows = poSelleru[key];

            let total = 0;
            for (let j = 0; j < sellerRows.length; j++) {
            total += Number(sellerRows[j].book.cijena) * Number(sellerRows[j].qty);
            }

            const narudzba = await orderDao.create({ kupacId: user.id, prodavacId: sellerId, tip: "Prodaja", ukupnaCijena: total }, t);

            await notificationDao.create({ userId: sellerId, tip: "Nova_narudzba", payloadJson: { orderId: narudzba.id, kupacId: user.id } }, t);

            for (let k = 0; k < sellerRows.length; k++) {
                let row = sellerRows[k];
                let q = Number(row.qty);
                if (!Number.isFinite(q) || q <= 0) q = 1;

                for (let x = 0; x < q; x++) {
                    await orderDao.createOrderItem({ orderId: narudzba.id, bookId: row.book.id, cijenaUTrenutku: row.book.cijena }, t);
                }
            }

            napravljeniOrderi.push(narudzba);
        }

        await cartDao.clearCart(user.id, t);
        return napravljeniOrderi;
        });
    }

    async rezervisiKnjige(bookIds, t) {
        for (let i = 0; i < (bookIds || []).length; i++) {
            const bookId = Number(bookIds[i]);
            if (!Number.isFinite(bookId)) throw new Error("Neispravan bookId!");

            const res = await bookDao.decrementQtyIfAvailable(bookId, 1, t);
            const affected = res && res[0] != null ? Number(res[0]) : 0;
            if (affected !== 1) throw new Error("Knjige nema na stanju!");

            const knjiga = await bookDao.findByIdForUpdate(bookId, t);
            if (knjiga) {
                let stanje = Number(knjiga.kolicinaDostupno);
                if (!Number.isFinite(stanje)) stanje = 0;
                if (stanje === 0 && knjiga.status === "Aktivna") await bookDao.updateInstance(knjiga, { status: "Rezervisana" }, t);
            }
        }
    }

    async vratiKnjiguNaStanje(bookIds, t) {
        for (let i = 0; i < (bookIds || []).length; i++) {
        const bookId = Number(bookIds[i]);
        if (!Number.isFinite(bookId)) continue;

        await bookDao.incrementQty(bookId, 1, t);

        const knjiga = await bookDao.findByIdForUpdate(bookId, t);
        if (knjiga) {
            let stanje = Number(knjiga.kolicinaDostupno);
            if (!Number.isFinite(stanje)) stanje = 0;

            if (knjiga.status !== "Arhivirana") {
            if (stanje > 0) await bookDao.updateInstance(knjiga, { status: "Aktivna" }, t);
            }
        }
        }
    }

    async listMyOrders(userId) {
        return orderDao.listByBuyer(userId);
    }

    async uzmiDetaljeNarudzbe(userId, orderId) {
        const id = Number(orderId);
        if (!Number.isFinite(id)) return null;

        const narudzba = await orderDao.findOwnedByBuyer(id, userId);
        if (!narudzba) return null;

        const items = await orderDao.listByOrder(narudzba.id);
        return { narudzba, items };
    }

    async otkaziNarudzbu(buyerId, orderId) {
        const id = Number(orderId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID narudzbe!");

        return db.sequelize.transaction(async (t) => {
        const narudzba = await orderDao.findOwnedByBuyer(id, buyerId, t);
        if (!narudzba) throw new Error("Narudzba nije pronadjena!");

        if (narudzba.status !== "Na_cekanju") throw new Error("Narudzbu je moguce otkazati samo ako je na cekanju!");

        const rows = await orderDao.listBookIdsByOrder(narudzba.id, t);

        let counts = {};
        let bookIds = [];

        for (let i = 0; i < rows.length; i++) {
            let bid = Number(rows[i].bookId);
            if (Number.isFinite(bid)) {
            const k = String(bid);
            if (!counts[k]) {
                counts[k] = 1;
                bookIds.push(bid);
            } else {
                counts[k] = counts[k] + 1;
            }
            }
        }

        await orderDao.updateByIdForBuyer(narudzba.id, buyerId, { status: "Otkazana", zavrsenaAt: new Date() }, t);

        for (let j = 0; j < bookIds.length; j++) {
            let bookId = bookIds[j];
            let dodatak = Number(counts[String(bookId)]);
            if (!Number.isFinite(dodatak) || dodatak <= 0) dodatak = 0;

            const knjiga = await bookDao.findByIdForUpdate(bookId, t);
            if (knjiga) {
            let stanje = Number(knjiga.kolicinaDostupno);
            if (!Number.isFinite(stanje)) stanje = 0;

            let novoStanje = stanje + dodatak;

            let noviStatus = knjiga.status;
            if (knjiga.status !== "Arhivirana") {
                if (novoStanje > 0) noviStatus = "Aktivna";
                else noviStatus = "Rezervisana";
            }

            await bookDao.updateInstance(knjiga, { kolicinaDostupno: novoStanje, status: noviStatus }, t);
            }
        }

        return true;
        });
    }
    }

    module.exports = new OrderService();