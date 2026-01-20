const lookupDao = require("../dao/LookupDao");
const userInterestsDao = require("../dao/UserInterestsDao");
const db = require("../models");

class ProfileService {
    _normalizeIdList(value) {
        var ids = [];
        var seen = {};

        if (value === undefined || value === null) return ids;

        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var n = Number(value[i]);
                if (Number.isFinite(n) && n > 0) {
                    var key = String(n);
                    if (!seen[key]) {
                        seen[key] = true;
                        ids.push(n);
                    }
                }
            }
            return ids;
        }

        var one = Number(value);
        if (Number.isFinite(one) && one > 0) {
            var key2 = String(one);
            if (!seen[key2]) {
                seen[key2] = true;
                ids.push(one);
            }
        }

        return ids;
    }

    normalizeInterests(body) {
        const zanrovi = body ? body.zanrovi : null;
        const jezici = body ? body.jezici : null;

        const genreIds = [];
        const languageIds = [];

        if (zanrovi !== undefined && zanrovi !== null) {
            if (Array.isArray(zanrovi)) {
                for (let i = 0; i < zanrovi.length; i++) {
                    const gid = Number(zanrovi[i]);
                    if (Number.isFinite(gid) && gid > 0) genreIds.push(gid);
                }
            } else {
                const gid2 = Number(zanrovi);
                if (Number.isFinite(gid2) && gid2 > 0) genreIds.push(gid2);
            }
        }

        if (jezici !== undefined && jezici !== null) {
            if (Array.isArray(jezici)) {
                for (let j = 0; j < jezici.length; j++) {
                    const lid = Number(jezici[j]);
                    if (Number.isFinite(lid) && lid > 0) languageIds.push(lid);
                }
            } else {
                const lid2 = Number(jezici);
                if (Number.isFinite(lid2) && lid2 > 0) languageIds.push(lid2);
            }
        }

        return { genreIds: genreIds, languageIds: languageIds };
    }

    async getInterestsFormData(userId) {
        const lookups = await lookupDao.getBookFormLookups();
        const ids = await userInterestsDao.getInterestIds(userId);

        return {
            genres: lookups.genres,
            languages: lookups.languages,
            selectedGenreIds: ids.genreIds,
            selectedLanguageIds: ids.languageIds,
        };
    }

    async updateInterests(userId, zanrovi, jezici) {
        var genreIds = this._normalizeIdList(zanrovi);
        var languageIds = this._normalizeIdList(jezici);

        return db.sequelize.transaction(async (t) => {
            await userInterestsDao.setInterests(userId, genreIds, languageIds, t);
        });
    }

    async saveInterests(userId, body) {
        if (!Number.isFinite(Number(userId))) throw new Error("Neispravan korisnik!");

        const normalized = this.normalizeInterests(body);
        const genreIds = normalized.genreIds;
        const languageIds = normalized.languageIds;

        const lookups = await lookupDao.getRegisterLookups();

        await db.sequelize.transaction(async (t) => {
            await userInterestsDao.setInterests(userId, genreIds, languageIds, t);
        });

        return { genres: lookups.genres, languages: lookups.languages, selectedGenreIds: genreIds, selectedLanguageIds: languageIds };
    }
}

module.exports = new ProfileService();