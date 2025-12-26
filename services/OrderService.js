const db = require("../models");
const cartDao = require("../dao/CartDao");
const notificationDao = require("../dao/NotificationDao");
const { noTrueLogging } = require("sequelize/lib/utils/deprecations");

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

                await notificationDao.create({
                    userId: sellerId,
                    tip: "Nova_narudzba",
                    payloadJson: {
                        orderId: narudzba.id,
                        kupacId: user.id,
                    },
                }, t);

                for (const r of sellerRows) {
                    const qty = Number(r.kolicina) || 1;
                    for (let i = 0; i < qty; i++) {
                        await db.OrderItem.create({
                            orderId: narudzba.id,
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
            const narudzba = await db.Order.findOne({
                where: { id, kupacId: buyerId },
                transaction: t,
            });
            if (!narudzba) throw new Error("Narudzba nije pronadjena!");

            if (narudzba.status !== "Na_cekanju") {
                throw new Error("Narudzbu je moguce otkazati samo ako je na cekanju!");
            }

            const rows = await db.OrderItem.findAll({
                where: { orderId: narudzba.id },
                attributes: ["bookId"],
                raw: true,
                transaction: t,
            });

            const bookIds = [];
            for (const r of rows) {
                if (r.bookId != null) bookIds.push(Number(r.bookId));
            }

            await db.Order.update(
                { status: "Otkazana", zavrsenaAt: new Date() },
                { where: { id: narudzba.id, kupacId: buyerId }, transaction: t }
            );

            if (bookIds.length > 0) {
                await db.Book.update(
                    { status: "Aktivna" },
                    { where: { id: bookIds }, transaction: t }
                );
            }

            return true;
        });
    }
}

module.exports = new OrderService();