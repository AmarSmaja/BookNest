const db = require("../models");
const sellerProfileDao = require("../dao/SellerProfileDao");
const notificationDao = require("../dao/NotificationDao");

class SellerApprovingService {
    async listPending() {
        const profili = await db.SellerProfile.findAll({
            where: { status: "PENDING" },
            order: [["requestedAt", "ASC"]],
            raw: true,
        });

        const userIds = [];
        const pogledao = new Set();

        for (let i = 0; i < profili.length; i++) {
            const uid = Number(profili[i].user_id || profili[i].userId);
            if (Number.isFinite(uid) && !pogledao.has(uid)) {
                pogledao.add(uid);
                userIds.push(uid);
            } 
        }

        const useri = await db.User.findAll({
            where: { id: userIds },
            attributes: ["id", "ime", "prezime", "email", "role"],
            raw: true,
        });

        const byId = {};
        for (let i = 0; i < useri.length; i++) {
            byId[useri[i].id] = useri[i];
        }

        const out = [];
        for (let i = 0; i < profili.length; i++) {
            const p = profili[i];
            const uid = Number(p.user_id || p.userId);
            const u = byId[uid] || null;

            out.push({
                userId: uid,
                status: p.status,
                cityId: p.city_id || p.cityId || null,
                profileImageUrl: p.profile_image_url || p.profileImageUrl || null,
                requestedAt: p.requested_at || p.requestedAt || null,
                reviewedAt: p.reviewed_at || p.reviewedAt || null,
                user: u,
            });
        }

        return out;
    }

    async podnesiZahtjev(user, formData) {
        if (!user) throw new Error("Nisi logovan!");

        const postoji = await sellerProfileDao.findByUserId(user.id);
        if (postoji) {
            if (postoji.status === "PENDING") throw new Error("Tvoj zahtjev je vec poslan i ceka odobrenje!");
            if (postoji.status === "APPROVED") throw new Error("Vec si odobren kao prodavac!");

            throw new Error("Tvoj zahtjev je odbijen. Kontaktiraj admina!");
        }

        let cityId = null;
        let profileImageUrl = null;

        if (formData) {
            if (formData.cityId != null && formData.cityId !== "") {
                const parsirano = Number(formData.cityId);
                if (Number.isFinite(parsirano)) {
                    cityId = parsirano;
                }
            }

            if (formData.profileImageUrl != null) {
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
                    payloadJson: { sellerProfileId: profil.userId, userId: user.id },
                }, t)
            }

            return profil;
        })
    }

    async odobri(adminUser, userId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const pid = Number(userId);
        if (!Number.isFinite(pid)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const profil = await db.SellerProfile.findByPk(pid, { transaction: t });
            if (!profil) throw new Error("Zahtjev nije pronadjen!");

            if (profil.status !== "PENDING") throw new Error("Zahtjev vise nije na cekanju!");

            await sellerProfileDao.updateStatus(pid, "APPROVED", new Date(), t);

            await db.User.update(
                { role: "Prodavac" },
                { where: { id: profil.userId }, transaction: t }
            );

            await notificationDao.create({
                userId: profil.userId,
                tip: "Prodavac_odobren",
                payloadJson: { userId: pid },
            }, t);

            return true;
        });
    }

    async odbij(adminUser, userId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const pid = Number(userId);
        if (!Number.isFinite(pid)) throw new Error("Neispravan ID!");

        return db.sequelize.transaction(async (t) => {
            const profil = await db.SellerProfile.findByPk(pid, { transaction: t });
            if (!profil) throw new Error("Zahtjev nije pronadjen!");

            if (profil.status !== "PENDING") throw new Error("Zahtjev vise nije na cekanju!");

            await sellerProfileDao.updateStatus(pid, "REJECTED", new Date(), t);

            await notificationDao.create({
                userId: profil.userId,
                tip: "Prodavac_odbijen",
                payloadJson: { userId: pid },
            }, t);

            return true;
        });
    }
}

module.exports = new SellerApprovingService();