const db = require("../models");
const orderDao = require("../dao/OrderDao");
const notificationDao = require("../dao/NotificationDao");

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

        // if (NEDOPUSTENO.includes(narudzba.status)) {
        //     throw new Error("Narudzba je vec zavrsena ili odbijena!");
        // }

        return db.sequelize.transaction(async (t) => {
            await orderDao.updateStatus(narudzba.id, user.id, noviStatus, t);

            await notificationDao.create({
                userId: narudzba.kupacId,
                tip: "Status_narudzbe",
                payloadJson: {
                    orderId: narudzba.id,
                    status: noviStatus,
                }
            }, t);

            const rows = await db.OrderItem.findAll({
                where: { orderId: narudzba.id },
                attributes: ["bookId"],
                raw: true,
                transaction: t,
            });

            const bookIdsSkup = new Set();
            
            for (const r of rows) {
                const id = Number(r.bookId);
                if (!Number.isNaN(id)) bookIdsSkup.add(id);
            }

            const bookIds = Array.from(bookIdsSkup);

            if (bookIds.length === 0) return;

            if (noviStatus === "Odbijena" || noviStatus === "Otkazana") {
                await db.Book.update(
                    { status: "Aktivna" },
                    { where: { id: bookIds }, transaction: t }
                );

                await orderDao.markCompleted(narudzba.id, user.id, t);
            }

            if (noviStatus === "Zavrsena") {
                await db.Book.update(
                    { status: "Prodana/Razmjenjena" },
                    { where: { id: bookIds }, transaction: t }
                );

                await orderDao.markCompleted(narudzba.id, user.id, t);
            }
        });
    }
}

module.exports = new SellerOrdersService();