const db = require("../models");
const sellerProfileDao = require("../dao/SellerProfileDao");
const notificationDao = require("../dao/NotificationDao");

class SellerApprovingService {
    async podnesiZahtjev(user, formData) {
        if (!user) throw new Error("Nisi logovan!");

        const postoji = await sellerProfileDao.findByUserId(user.id, null);
        if (postoji) {
            if (postoji.status === "PENDING") throw new Error("Tvoj zahtjev je vec poslan i ceka odobrenje admina!");
            if (postoji.status === "APPROVED") throw new Error("Vec si odobren kao prodavac!");
            throw new Error("Tvoj zahtjev je odbijen. Kontakiraj admina!");
        }

        let cityId = null;
        let profileImageUrl = null;

        if (formData) {
            if (formData.cityId != null && String(formData.cityId).trim() !== "") {
                const parsed = Number(formData.cityId);
                if (Number.isFinite(parsed) && parsed > 0) {
                    cityId = parsed;
                }
            }

            if (formData.profileImageUrl != null) {
                const s = String(formData.profileImageUrl).trim();
                if (s.length > 0) profileImageUrl = s;
            }
        }

        if (!cityId) throw new Error("Grad je obavezan!");

        return db.sequelize.transaction(async (t) => {
            const profil = await sellerProfileDao.create({
                userId: user.id,
                cityId: cityId,
                profileImageUrl: profileImageUrl,
                status: "PENDING",
                requestedAt: new Date(),
                reviewedAt: null,
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
        });
    }

    async listPending(adminUser) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const profili = await sellerProfileDao.listPending(null);

        const userIds = [];
        const seen = new Set();

        for (let i = 0; i < profili.length; i++) {
            const uid = Number(profili[i].userId);
            if (Number.isFinite(uid) && !seen.has(uid)) {
                seen.add(uid);
                userIds.push(uid);
            }
        }

        const useri = await db.User.findAll({
            where: { id: userIds },
            attributes: ["id", "ime", "prezime", "email", "role"],
            raw: true,
        });

        const byId = [];
        for (let i = 0; i < useri.length; i++) {
            byId[useri[i].id] = useri[i];
        }

        const rows = [];
        for (let i = 0; i < profili.length; i++) {
            const p = profili[i];
            const uid = Number(p.UserId);
            rows.push({ profile: p, user: byId[uid] || null });
        }

        return rows;
    }

    async odobri(adminUser, sellerUserId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(sellerUserId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const profil = await sellerProfileDao.findByUserId(uid, t);
            if (!profil) throw new Error("Zahtjev nije pronadjen!");
            if (profil.status !== "PENDING") throw new Error("Zahtjev vise nije na cekanju!");

            await sellerProfileDao.updateStatus(uid, "APPROVED", new Date(), t);

            await db.User.update(
                { role: "Prodavac" },
                { where: { id: uid }, transaction: t }
            );

            await notificationDao.create({
                userId: uid,
                tip: "Prodavac_odobren",
                payloadJson: { sellerUserId: uid },
            }, t);

            return true;
        });
    }

    async odbij(adminUser, sellerUserId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(sellerUserId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const profil = await sellerProfileDao.findByUserId(uid, t);
            if (!profil) throw new Error("Zahtjev nije pronadjen!");
            if (profil.status !== "PENDING") throw new Error("Zahtjev vise nije na cekanju!");

            await sellerProfileDao.updateStatus(uid, "REJECTED", new Date(), t);

            await notificationDao.create({
                userId: uid,
                tip: "Prodavac_odbijen",
                payloadJson: { sellerUserId: uid },
            }, t);

            return true;
        })
    }
}

module.exports = new SellerApprovingService();