const db = require("../models");
const orderDao = require("../dao/OrderDao");

const DOPUSTENO = ["Na_cekanju", "Prihvacena", "Odbijena", "Zavrsena", "Otkazana"];

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

        if (narudzba.status === "Zavrsena" || narudzba.status === "Odbijena") {
            throw new Error("Narudzba je zavrsena ili odbijena!");
        }

        return db.sequelize.transaction(async (t) => {
            await orderDao.updateStatus(narudzba.id, user.id, noviStatus, t);

            if (noviStatus === "Zavrsena") {
                await orderDao.markCompleted(narudzba.id, user.id, t);
            }
        });
    }
}

module.exports = new SellerOrdersService();