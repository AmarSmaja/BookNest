const db = require("../models");
const sellerProfileDao = require("../dao/SellerProfileDao");
const notificationDao = require("../dao/NotificationDao");

class SellerApprovingService {
    async podnesiZahtjev(user, formData) {
        if (!user) throw new Error("Nisi logovan!");

        const postoji = await sellerProfileDao.findByUserId(user.id);
        if (postoji) {
            if (postoji.status === "PENDING") {
                throw new Error("Tvoj zahtjev je vec poslan i ceka odobrenje admina!");
            }
            if (postoji.status === "APPROVED") {
                throw new Error("Vec si odobren kao prodavac!")
            }
            throw new Error("Tvoj zahtjev je odbijen. Kontaktiraj admina!");
        }

        let cityId = null;
        let profileImageUrl = null;

        if (formData) {
            if (formData.cityId !== null && formData.cityId !== undefined && formData.cityId !== "") {
                const parsirano = Number(formData.cityId);
                if (Number.isFinite(parsirano)) {
                    cityId = parsirano;
                }
            }

            if (formData.profileImageUrl !== null && formData.profileImageUrl !== undefined) {
                const s = String(formData.profileImageUrl).trim();
                if (s.length > 0) {
                    profileImageUrl = s;
                }
            }
        }

        return db.sequelize.transaction(async (t) => {
            const profil = await sellerProfileDao.create({
                userId: user.id,
                cityId: cityId,
                profileImageUrl: profileImageUrl,
                status: "PENDING",
                requestedAt: new Date(),
                reviewedAt: null
            }, t);

            const admini = await db.User.findAll({
                where: { role: "Admin" },
                attributes: ["id"],
                raw: true,
                transaction: t,
            });

            for (let i = 0; i < admini.length; i++) {
                const adminId = Number(admini[i].id);
                if (!Number.isFinite(adminId)) continue;

                await notificationDao.create({
                    userId: adminId,
                    tip: "Zahtjev_prodavac",
                    payloadJson: { sellerUserId: user.id },
                }, t);
            }

            return profil;
        })
    }

    async listPending(adminUser) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");
        return sellerProfileDao.listPending();
    }

    async odobri(adminUser, sellerUserId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const pid = Number(sellerUserId);
        if (!Number.isFinite(pid)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const profil = await db.SellerProfile.findByPk(pid, { transaction: t });
            if (!profil) throw new Error("Zahtjev nije pronadjen!");
            if (profil.status !== "PENDING") throw new Error("Zahtjev vise nije na cekanju!");

            await sellerProfileDao.updateStatus(pid, "APPROVED", new Date(), t);

            await db.User.update(
                { role: "Prodavac" },
                { where: { id: pid }, transaction: t }
            );

            await notificationDao.create({
                userId: pid,
                tip: "Prodavac_odobren",
                payloadJson: { sellerUserId: pid },
            }, t);

            return true;
        });
    }

    async odbij(adminUser, sellerUserId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const pid = Number(sellerUserId);
        if (!Number.isFinite(pid)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const profil = await db.SellerProfile.findByPk(pid, { transaction: t });
            if (!profil) throw new Error("Zahtjev nije pronadjen!");
            if (profil.status !== "PENDING") throw new Error("Zahtjev vise nije na cekanju!");

            await sellerProfileDao.updateStatus(pid, "REJECTED", new Date(), t);

            await notificationDao.create({
                userId: pid,
                tip: "Prodavac_odbijen",
                payloadJson: { sellerUserId: pid },
            }, t);

            return true;
        });
    }
}

module.exports = new SellerApprovingService();