const bcrypt = require("bcryptjs");
const userDao = require("../dao/UserDao");

class AuthService {
    async register({ ime, prezime, email, password }) {
        const postoji = await userDao.findByEmail(email);
        if (postoji) throw new Error("Vec postoji korisnik sa tim E-mailom.");

        if (!password || password.length < 6) {
            throw new Error("Password mora imati najmanje 6 karaktera.");
        } 

        const passwordHash = await bcrypt.hash(password, 10);

        return userDao.create({
            ime,
            prezime,
            email,
            passwordHash,
            role: "Kupac",
            status: "Aktivan",
            blokiranDo: null,
        });
    }

    async login({ email, password }) {
        const user = await userDao.findByEmail(email);
        if (!user) throw new Error("Neispravan mail ili password.");

        if (user.status === "Deaktiviran" || user.status === "Arhiviran") {
            throw new Error("Nalog nije aktivan.");
        }

        if (user.blokiranDo && new Date(user.blokiranDo) > new Date()) {
            throw new Error("Nalog je blokiran do: " + new Date(user.blokiranDo).toLocaleString());
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error("Neispravan email ili password.");

        return user;
    }
}

module.exports = new AuthService();