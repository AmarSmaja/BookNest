const db = require("../models");
const userDao = require("../dao/UserDao");

class AdminUserService {
    async listUsers(adminUser) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");
        return userDao.listAll();
    }

    async setRole(adminUser, userId, role) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(userId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID korisnika!");
        if (uid === adminUser.id) throw new Error("Ne mozes mijenjati svoju ulogu!");

        const dopusteno = ["Admin", "Prodavac", "Kupac"];
        if (!dopusteno.includes(role)) throw new Error("Neispravna uloga!");

        const updated = await userDao.updateById(uid, { role: role });
        if (!updated) throw new Error("User ne postoji!");

        return updated;
    }

    async setStatus(adminUser, userId, status) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(userId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID korisnika!");
        if (uid === adminUser.id) throw new Error("Ne mozes mijenjati svoj status!");

        const dopusteno = ["Aktivan", "Deaktiviran", "Arhiviran", "Blokiran"];
        if (!dopusteno.includes(status)) throw new Error("Neispravan status!");

        const u = await db.User.findByPk(uid);
        if (!u) throw new Error("User ne postoji");

        if (u.role === "Prodavac") {
            if (status === "Blokiran" || status === "Deaktiviran" || status === "Arhiviran") {
                await db.Book.update(
                    { status: "Arhivirana" },
                    { where: { prodavacId: uid } }
                );
            }
        }

        let blokiranDo = u.blokiranDo;
        if (status !== "Blokiran") {
            blokiranDo = null;
        }

        const updated = await userDao.updateById(uid, { status: status, blokiranDo: blokiranDo });
        if (!updated) throw new Error("User ne postoji");

        return updated;
    }

    async blockUser(adminUser, userId, daniIliNull) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(userId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID korisnika!");
        if (uid === adminUser.id) throw new Error("Ne mozes blokirati sebe!");

        let blokiranDo = null;

        if (daniIliNull != null) {
            const s = String(daniIliNull).trim();
            if (s !== "") {
                const dani = Number(s);
                if (!Number.isFinite(dani) || dani <= 0) throw new Error("Dani moraju biti pozitivan broj!");
                blokiranDo = new Date(Date.now() + dani * 24 * 60 * 60 * 1000);
            }
        }

        return db.sequelize.transaction(async (t) => {
            const u = await db.User.findByPk(uid, { transaction: t });
            if (!u) throw new Error("User ne postoji!");

            if (u.role === "Prodavac") {
                await db.Book.update(
                    { status: "Arhivirana" },
                    { where: { prodavacId: uid }, transaction: t }
                );
            }

            const updated = await userDao.updateById(uid, { status: "Blokiran", blokiranDo: blokiranDo });
            if (!updated) throw new Error("User ne postoji!");

            return updated;
        })
    }

    async unblockUser(adminUser, userId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(userId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID korisnika!");
        if (uid === adminUser.id) throw new Error("Ne mozes odblokirati sebe!");

        const updated = await userDao.updateById(uid, { status: "Aktivan", blokiranDo: null });
        if (!updated) throw new Error("User ne postoji!");

        return updated;
    }
}

module.exports = new AdminUserService();