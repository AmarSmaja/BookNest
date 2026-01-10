const db = require("../models");
const lookupDao = require("../dao/LookupDao");
const userInterestsDao = require("../dao/UserInterestsDao");

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
}

module.exports = new ProfileService();