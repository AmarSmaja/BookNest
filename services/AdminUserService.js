const db = require("../models");
const userDao = require("../dao/UserDao");
const bookDao = require("../dao/BookDao");

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

        let r = "";
        if (role != null) r = String(role).trim();

        if (dopusteno.indexOf(r) === -1) throw new Error("Neispravna uloga!");

        const updated = await userDao.updateById(uid, { role: r });
        if (!updated) throw new Error("User ne postoji!");

        return updated;
    }

    async setStatus(adminUser, userId, status) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const uid = Number(userId);
        if (!Number.isFinite(uid)) throw new Error("Neispravan ID korisnika!");
        if (uid === adminUser.id) throw new Error("Ne mozes mijenjati svoj status!");

        const dopusteno = ["Aktivan", "Deaktiviran", "Arhiviran", "Blokiran"];

        let s = "";
        if (status != null) s = String(status).trim();

        if (dopusteno.indexOf(s) === -1) throw new Error("Neispravan status!");
        
        return db.sequelize.transaction(async (t) => {
            const u = await userDao.findById(uid, t);
            if (!u) throw new Error("User ne postoji!");

            if (u.role === "Prodavac") {
                if (s === "Blokiran" || s === "Deaktiviran" || s === "Arhiviran") {
                    await bookDao.archiveAllBySellerId(uid, t);
                }
            }

            let blokiranDo = u.blokiranDo;
            if (s !== "Blokiran") blokiranDo = null;

            const updated = await userDao.updateById(uid, { status: s, blokiranDo: blokiranDo }, t);
            if (!updated) throw new Error("User ne postoji!");

            return updated;
        });
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
            const u = await userDao.findById(uid, t);
            if (!u) throw new Error("User ne postoji!");

            if (u.role === "Prodavac") {
                await bookDao.archiveAllBySellerId(uid, t);
            }

            const updated = await userDao.updateById(uid, { status: "Blokiran", blokiranDo: blokiranDo }, t);
            if (!updated) throw new Error("User ne postoji!");

            return updated;
        });
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