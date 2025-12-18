const userDao = require("../dao/UserDao");

class AdminUserService{ 
    async listUsers() {
        return userDao.listAll();
    }

    async setRole(userId, role) {
        const dopusteno = ["Admin", "Prodavac", "Kupac"];
        if (!dopusteno.includes(role)) throw new Error("Neispravna uloga.");
        const updated = await userDao.updateById(userId, { role });
        if (!updated) throw new Error("User ne postoji");
        return updated;
    }

    async setStatus(userId, status) {
        const dopusteno = ["Aktivan", "Deaktiviran", "Arhiviran", "Blokiran"];
        if (!dopusteno.includes(status)) throw new Error("Neispravan status.");
        const updated = await userDao.updateById(userId, { status });
        if (!updated) throw new Error("User ne postoji.");
        return updated;
    }

    async blockUser(userId, daysOrNull) {
        let blokiranDo = null;
        if (daysOrNull !== null) {
            const dani = Number(daysOrNull);
            if (!Number.isFinite(dani) || days <= 0) throw new Error("Dani moraju biti pozitivan broj.");
            blokiranDo = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }

        const updated = await userDao.updateById(userId, { status: "Blokiran", blokiranDo });
        if (!updated) throw new Error("User ne postoji.");
        return updated;
    }

    async unblockUser(userId) {
        const updated = await userDao.updateById(userId, { status: "Aktivan", blokiranDo: null });
        if (!updated) throw new Error("User ne postoji.");
        return updated;
    }
}

module.exports = new AdminUserService();