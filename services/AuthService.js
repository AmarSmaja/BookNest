const bcrypt = require("bcryptjs");
const userDao = require("../dao/UserDao");
const db = require("../models");
const userInterestsDao = require("../dao/UserInterestsDao");
const lookupDao = require("../dao/LookupDao");

class AuthService {
    _normalizeIdList(value) {
        let ids = [];
        let seen = {};

        if (value === undefined || value === null) return ids;

        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                let n = Number(value[i]);
                if (Number.isFinite(n) && n > 0) {
                    let key = String(n);
                    if (!seen[key]) {
                        seen[key] = true;
                        ids.push(n);
                    }
                }
            }
            return ids;
        }

        let one = Number(value);
        if (Number.isFinite(one) && one > 0) {
            let key2 = String(one);
            if (!seen[key2]) {
                seen[key2] = true;
                ids.push(one);
            }
        }

        return ids;
    }

    async register({ ime, prezime, email, password, zanrovi, jezici }) {

        const postoji = await userDao.findByEmail(email);
        if (postoji) throw new Error("Vec postoji korisnik sa tim E-mailom.");

        if (!password || password.length < 6) {
            throw new Error("Password mora imati najmanje 6 karaktera.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const genreIds = this._normalizeIdList(zanrovi);
        const languageIds = this._normalizeIdList(jezici);

        return db.sequelize.transaction(async (t) => {
            const user = await db.User.create(
                {
                    ime: ime,
                    prezime: prezime,
                    email: email,
                    passwordHash: passwordHash,
                    role: "Kupac",
                    status: "Aktivan",
                    blokiranDo: null,
                },
                { transaction: t }
            );

            await userInterestsDao.setInterests(user.id, genreIds, languageIds, t);
            return user;
        });
    }

    async login({ email, password }) {
        const user = await userDao.findByEmail(email);
        if (!user) throw new Error("Neispravan email!");

        if (user.status === "Deaktiviran" || user.status === "Arhiviran") throw new Error("Nalog nije aktivan!");
        if (user.blokiranDo && new Date(user.blokiranDo) > new Date()) throw new Error("Account je blokiran do: " + new Date(user.blokiranDo).toLocaleString());

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error("Neispravan password!");

        return user;
    }

    async getRegisterData() {
        return lookupDao.getRegisterLookups();
    }
}

module.exports = new AuthService();