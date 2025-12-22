const db = require("../models");
const cartDao = require("../dao/CartDao");

class OrderService {
    async checkoutFromCart(user) {
        const sequelize = db.sequelize;
        if (!sequelize) throw new Error("db.sequelize nije dostupan!");

        return sequelize.transaction(async (t) => {
            const { items } = await cartDao.getCartView(user.id);
            const rows = items.filter(r => r.book);

            if (rows.length === 0) throw new Error("Korpa je prazna!");

            for (const r of rows) {
                if (r.book.status !== "Aktivna") {
                    throw new Error(`Knjiga ${r.book.naziv} vise nije dostupna!`);
                }

                if (r.book.prodavacId === user.id) {
                    throw new Error("Ne mozes kupiti svoju knjigu!");
                }
            }

            const grupisiPoSelleru = new Map();
            for (const r of rows) {
                const sid = r.book.prodavacId;
                if (!grupisiPoSelleru.has(sid)) grupisiPoSelleru.set(sid, []);
                grupisiPoSelleru.get(sid).push(r);
            }

            const napravljeniOrderi = [];

            for (const [sellerId, sellerRows] of grupisiPoSelleru.entries()) {
                let total = 0;
                for (const r of sellerRows) {
                    total += Number(r.book.cijena) * Number(r.kolicina);
                }

                const narudzba = await db.Order.create({
                    kupacId: user.id, 
                    prodavacId: sellerId,
                    tip: "Prodaja",
                    ukupnaCijena: total,
                }, { transaction: t });

                for (const r of sellerRows) {
                    const qty = Number(r.kolicina) || 1;
                    for (let i = 0; i < qty; i++) {
                        await db.OrderItem.create({
                            orderId: order.id,
                            bookId: r.book.id,
                            cijenaUTrenutku: r.book.cijena,
                        }, { transaction: t });
                    }

                    await db.Book.update(
                        { status: "Rezervisana" }, 
                        { where: { id: r.book.id }, transaction: t }
                    );
                }

                napravljeniOrderi.push(narudzba);
            }

            await cartDao.clearCart(user.id, t);
            return napravljeniOrderi;
        });
    }

    async listMyOrders(userId) {
        return db.Order.findAll({
            where: { kupacId: userId },
            order: [["id", "ASC"]],
        });
    }
}

module.exports = new OrderService();