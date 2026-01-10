const db = require("../models");

class UserInterestsDao {
    async setInterests(userId, genreIds, languageIds, t) {
        var opts1 = { where: { userId: userId } };
        if (t !== undefined && t !== null) opts1.transaction = t;

        await db.UserGenreInterest.destroy(opts1);
        await db.UserLanguageInterest.destroy(opts1);

        if (genreIds && genreIds.length > 0) {
            for (var i = 0; i < genreIds.length; i++) {
                var gid = Number(genreIds[i]);
                if (Number.isFinite(gid) && gid > 0) {
                    var createOpts = {};
                    if (t !== undefined && t !== null) createOpts.transaction = t;

                    await db.UserGenreInterest.create(
                        { userId: userId, genreId: gid },
                        createOpts
                    );
                }
            }
        }

        if (languageIds && languageIds.length > 0) {
            for (var j = 0; j < languageIds.length; j++) {
                var lid = Number(languageIds[j]);
                if (Number.isFinite(lid) && lid > 0) {
                    var createOpts2 = {};
                    if (t !== undefined && t !== null) createOpts2.transaction = t;

                    await db.UserLanguageInterest.create(
                        { userId: userId, languageId: lid },
                        createOpts2
                    );
                }
            }
        }
    }

    async getInterestIds(userId) {
        const gi = await db.UserGenreInterest.findAll({
            where: { userId: userId },
            attributes: ["genreId"],
            raw: true,
        });

        const li = await db.UserLanguageInterest.findAll({
            where: { userId: userId },
            attributes: ["languageId"],
            raw: true,
        });

        var genreIds = [];
        for (var i = 0; i < gi.length; i++) {
            var id = Number(gi[i].genreId);
            if (Number.isFinite(id) && id > 0) genreIds.push(id);
        }

        var languageIds = [];
        for (var j = 0; j < li.length; j++) {
            var id2 = Number(li[j].languageId);
            if (Number.isFinite(id2) && id2 > 0) languageIds.push(id2);
        }

        return { genreIds: genreIds, languageIds: languageIds };
    }
}

module.exports = new UserInterestsDao();