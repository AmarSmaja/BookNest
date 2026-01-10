const { Op, literal } = require("sequelize");
const db = require("../models");
const cartDao = require("../dao/CartDao");
const notificationDao = require("../dao/NotificationDao");

class OrderService {
    async checkoutFromCart(user) {
        const sequelize = db.sequelize;
        if (!sequelize) throw new Error("Error sa sequelizeom!");

        return sequelize.transaction(async (t) => {
            const rezultat = await cartDao.getCartView(user.id);
            const items = rezultat.items;

            var rows = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].book) {
                    rows.push(items[i]);
                }
            }

            if (rows.length === 0) throw new Error("Korpa je prazna!");

            let poSelleru = {};
            let sellerIds = [];

            for (let rIndex = 0; rIndex < rows.length; rIndex++) {
                let r = rows[rIndex];

                let qty = Number(r.kolicina);
                if (!Number.isFinite(qty) || qty <= 0) qty = 1;

                const knjiga = await db.Book.findOne({
                    where: { id: r.book.id },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!knjiga) throw new Error("Jedna od knjiga vise ne postoji!");
                if (knjiga.status !== "Aktivna") throw new Error("Jedna od knjiga vise nije dostupna!");
                if (knjiga.prodavacId === user.id) throw new Error("Ne mozes kupiti svoju knjigu!");

                let stanje = Number(knjiga.kolicinaDostupno);
                if (!Number.isFinite(stanje)) stanje = 0;

                if (stanje < qty) throw new Error("Nema dovoljno primjeraka te knjige na stanju za jednu od knjiga0!");

                let novoStanje = stanje - qty;
                let noviStatus = "Aktivna";
                
                if (novoStanje === 0) {
                    noviStatus = "Rezervisana";
                }

                await knjiga.update(
                    { kolicinaDostupno: novoStanje, status: noviStatus },
                    { transaction: t },
                );

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
                
                const narudzba = await db.Order.create({
                    kupacId: user.id,
                    prodavacId: sellerId,
                    tip: "Prodaja",
                    ukupnaCijena: total,
                }, { transaction: t });

                await notificationDao.create({
                    userId: sellerId,
                    tip: "Nova_narudzba",
                    payloadJson: { orderId: narudzba.id, kupacId: user.id },
                }, t);

                for (let k = 0; k < sellerRows.length; k++) {
                    let row = sellerRows[k];
                    let q = Number(row.qty);
                    if (!Number.isFinite(q) || q <= 0) q = 1;

                    for (let x = 0; x < q; x++) {
                        await db.OrderItem.create({
                            orderId: narudzba.id,
                            bookId: row.book.id,
                            cijenaUTrenutku: row.book.cijena,
                        }, { transaction: t });
                    }
                }

                napravljeniOrderi.push(narudzba);
            }

            await cartDao.clearCart(user.id, t);
            return napravljeniOrderi;
        });
    }

    async rezervisiKnjige(bookIds, t) {
        for (let i = 0; i < bookIds.length; i++) {
            const bookId = Number(bookIds[i]);
            if (!Number.isFinite(bookId)) throw new Error("Neispravan bookId!");

            const [affected] = await db.Book.update(
                { kolicinaDostupno: literal('"kolicina_dostpuno" - 1') },
                {
                    where: {
                        id: bookId,
                        status: "Aktivna",
                        kolicinaDostupno: { [Op.gte]: 1 },
                    }, transaction: t,
                }
            );

            if (affected !== 1) throw new Error("Knjige nema na stanju!");

            await db.Book.update(
                { status: "Prodana/Razmjenjena" },
                {
                    where: {
                        id: bookId,
                        status: "Aktivna",
                        kolicinaDostupno: 0,
                    }, transaction: t,
                }
            );
        }
    }

    async vratiKnjiguNaStanje(bookIds, t) {
        for (let i = 0; i < bookIds.length; i++) {
            const bookId = Number(bookIds[i]);
            if (!Number.isFinite(bookId)) continue;

            await db.Book.update(
                { kolicinaDostupno: literal('"kolicina_dostupno" + 1') },
                { where: { id: bookId }, transaction: t }
            );

            await db.Book.update(
                { status: "Aktivna" },
                {
                    where: {
                        id: bookId,
                        status: "Prodana/Razmjenjena",
                        kolicinaDostupno: { [Op.gt]: 0 },
                    }, transaction: tt
                }
            );
        }
    }

    async listMyOrders(userId) {
        return db.Order.findAll({
            where: { kupacId: userId },
            order: [["id", "ASC"]],
        });
    }

    async uzmiDetaljeNarudzbe(userId, orderId) {
        const id = Number(orderId);
        if (!Number.isFinite(id)) return null;

        const narudzba = await db.Order.findOne({
            where: { id, kupacId: userId },
        });
        if (!narudzba) return null;

        const items = await db.OrderItem.findAll({
            where: { orderId: narudzba.id },
            include: [{ model: db.Book, as: "knjiga", required: false }],
            order: [["id", "ASC"]],
        });

        return { narudzba, items };
    }

    async otkaziNarudzbu(buyerId, orderId) {
        const id = Number(orderId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID narudzbe!");

        return db.sequelize.transaction(async (t) => {
            const narudzba = await db.Order.findOne({ where: { id: id, kupacId: buyerId }, transaction: t });
            if (!narudzba) throw new Error("Narudzba nije pronadjena!");

            if (narudzba.status !== "Na_cekanju") throw new Error("Narudzbu je moguce otkazati samo ako je na cekanju!");

            const rows = await db.OrderItem.findAll({
                where: { orderId: narudzba.id },
                attributes: ["id"],
                raw: true,
                transaction: t,
            });

            let counts = [];
            let bookIds = [];

            for (let i = 0; i < rows.length; i++) {
                let bid = Number(rows[i].bookId);
                if (Number.isFinite(bid)) {
                    if (!counts[bid]) {
                        counts[bid] = 1;
                        bookIds.push(bid);
                    } else {
                        counts[bid] = counts[bid] + 1;
                    }
                }
            }

            await db.Order.update(
                { status: "Otkazana", zavrsenaAt: new Date() },
                { where: { id: narudzba.id, kupacId: buyerId }, transaction: t }
            );

            for (let j = 0; j < bookIds.length; j++) {
                let bookId = bookIds[j];
                let dodatak = Number(counts[bookId]);
                if (!Number.isFinite(dodatak) || dodatak <= 0) dodatak = 0;

                const knjiga = await db.Book.findOne({
                    where: { id: bookId },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (knjiga) {
                    let stanje = Number(knjiga.kolicinaDostupno);
                    if (!Number.isFinite(stanje)) stanje = 0;

                    let novoStanje = stanje + dodatak;

                    let noviStatus = knjiga.status;
                    if (knjiga.status !== "Arhivirana") {
                        if (novoStanje > 0) {
                            noviStatus = "Aktivna";
                        } else {
                            noviStatus = "Rezervisana";
                        }
                    }

                    await knjiga.update(
                        { kolicinaDostupno: novoStanje, status: noviStatus },
                        { transaction: t }
                    );
                }
            }

            return true;
        });
    }
}

module.exports = new OrderService();