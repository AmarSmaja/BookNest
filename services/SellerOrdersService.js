const db = require("../models");
const orderDao = require("../dao/OrderDao");
const notificationDao = require("../dao/NotificationDao");
const bookDao = require("../dao/BookDao");

const DOPUSTENO = ["Na_cekanju", "Prihvacena", "Odbijena", "Zavrsena", "Otkazana"];
const NEDOPUSTENO = ["Odbijena", "Otkazana", "Zavrsena"];

function dozvoljenPrijelaz(from, to) {
    if (!DOPUSTENO.includes(to)) return false;
    if (NEDOPUSTENO.includes(from)) return false;

    if (from === "Na_cekanju" && (to === "Prihvacena" || to === "Odbijena")) return true;
    if (from === "Prihvacena" && (to === "Zavrsena" || to === "Odbijena")) return true;

    return false;
}

class SellerOrdersService {
    async listMyOrders(user) {
        return orderDao.findForSeller(user.id);
    }

    async getDetail(user, orderId) {
        const id = Number(orderId);
        if (!Number.isFinite(id)) return null;

        const order = await orderDao.findOwnedById(id, user.id);
        if (!order) return null;

        const items = await orderDao.getOrderItemsWithBooks(order.id);
        return { order, items };
    }

    async changeStatus(user, orderId, noviStatus) {
        const id = Number(orderId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID narudzbe!");
        if (!DOPUSTENO.includes(noviStatus)) throw new Error("Neispravan status!");

        const narudzba = await orderDao.findOwnedById(id, user.id);
        if (!narudzba) throw new Error("Narudzba nije pronadjena!");

        if (!dozvoljenPrijelaz(narudzba.status, noviStatus)) {
            throw new Error(`Nije dozvoljeno: ${narudzba.status} -> ${noviStatus}`);
        }

        return db.sequelize.transaction(async (t) => {
            await orderDao.updateStatus(narudzba.id, user.id, noviStatus, t);

            await notificationDao.create({ userId: narudzba.kupacId, tip: "Status_narudzbe", payloadJson: { orderId: narudzba.id, status: noviStatus, } }, t);

            const rows = await orderDao.listOrderItemBookIds(narudzba.id, t);

            let counts = {};
            let bookIds = [];

            for (let i = 0; i < rows.length; i++) {
                const bid = Number(rows[i].bookId);
                if (Number.isFinite(bid)) {
                    const key = String(bid);
                    if (counts[key] === undefined) {
                        counts[key] = 1;
                        bookIds.push(bid)
                    } else {
                        counts[key] = counts[key] + 1;
                    }
                }
            }

            if (noviStatus === "Odbijena" || noviStatus === "Otkazana") {
                for (let j = 0; j < bookIds.length; j++) {
                    const bookId = bookIds[j];

                    let dodatak = 0;
                    const key = String(bookId);
                    if (counts[key] !== undefined) {
                        const n = Number(counts[key]);
                        if (Number.isFinite(n) && n > 0) dodatak = n;
                    }

                    const knjiga = await bookDao.findByIdForUpdate(bookId, t);
                    if (knjiga) {
                        let stanje = Number(knjiga.kolicinaDostupno);
                        if (!Number.isFinite(stanje)) stanje = 0;

                        const novoStanje = stanje + dodatak;

                        let noviBookStatus = knjiga.status;
                        if (knjiga.status !== "Arhivirana") {
                            if (novoStanje > 0) noviBookStatus = "Aktivna";
                            else noviBookStatus = "Rezervisana";
                        }

                        await bookDao.updateById(bookId, { kolicinaDostupno: novoStanje, status: noviBookStatus }, t);
                    }
                }

                await orderDao.markCompleted(narudzba.id, user.id, t);
                return;
            }

            if (noviStatus === "Zavrsena") {
                for (let k = 0; k < bookIds.length; k++) {
                    const bId = bookIds[k];

                    const knjiga2 = await bookDao.findByIdForUpdate(bId, t);
                    if (knjiga2) {
                        let stanje2 = Number(knjiga2.kolicinaDostupno);
                        if (!Number.isFinite(stanje2)) stanje2 = 0;

                        let status2 = knjiga2.status;

                        if (knjiga2.status !== "Arhivirana") {
                            if (stanje2 === 0) status2 = "Prodana/Razmjenjena";
                            else status2 = "Aktivna";
                        }

                        await bookDao.updateInstance(knjiga2, { status: status2 }, t);
                    }
                }

                await orderDao.markCompleted(narudzba.id, user.id, t);
                
                return;
            }
        });
    }
}

module.exports = new SellerOrdersService();