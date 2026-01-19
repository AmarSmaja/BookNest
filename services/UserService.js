const bcrypt = require("bcryptjs");
const userDao = require("../dao/UserDao");

class UserService {
    async getMe(user) {
        if (!user || !user.id) throw new Error("Nisi logovan!");
        const u = await userDao.findPublicById(user.id);
        if (!u) throw new Error("Korisnik ne postoji!");
        return u;
    }

    async getPublicProfile(userId) {
        const id = Number(userId);
        if (!Number.isFinite(id) || id <= 0) return null;

        const u = await userDao.findPublicById(id);
        if (!u) return null;

        return u;
    }

    async updateMe(user, formData) {
        if (!user || !user.id) throw new Error("Nisi logovan!");

        const ime = formData && formData.ime != null ? String(formData.ime).trim() : "";
        const prezime = formData && formData.prezime != null ? String(formData.prezime).trim() : "";

        let profileImageUrl = null;
        if (formData && formData.profileImageUrl != null) {
            const s = String(formData.profileImageUrl).trim();
            if (s.length > 0) profileImageUrl = s;
        }

        if (!ime) throw new Error("Ime je obavezno!");
        if (!prezime) throw new Error("Prezime je obavezno!");

        const patch = {
            ime: ime,
            prezime: prezime,
            profileImageUrl: profileImageUrl,
        };

        const updated = await userDao.updateById(user.id, patch);        
        return updated;
    }

    async changePassword(user, body) {
        if (!user || !user.id) throw new Error("Nisi logovan!");

        const oldPassword = body && body.oldPassword != null ? String(body.oldPassword) : "";
        const newPassword = body && body.newPassword != null ? String(body.newPassword) : "";
        const newPassword2 = body && body.newPassword2 != null ? String(body.newPassword2) : "";

        if (!oldPassword) throw new Error("Stara sifra je obavezna!");
        if (!newPassword || newPassword.length < 6) throw new Error("Nova sifra mora imati najmanje 6 karaktera");
        if (newPassword !== newPassword2) throw new Error("Nova sifra i potvrda se ne uklapaju!");

        const u = await userDao.findWithPasswordById(user.id);
        if (!u) throw new Error("Korisnik ne postoji!");

        const ok = await bcrypt.compare(oldPassword, u.passwordHash);
        if (!ok) throw new Error("Stara sifra nije tacna!");

        const hash = await bcrypt.hash(newPassword, 10);
        await userDao.updateById(user.id, { passwordHash: hash });

        return true;
    }
}

module.exports = new UserService();