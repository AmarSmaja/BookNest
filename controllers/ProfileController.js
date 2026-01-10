const db = require("../models");
const profileService = require("../services/ProfileService");
const userInterestsDao = require("../dao/UserInterestsDao");

class ProfileController {
    async showInterests(req, res) {
        const userId = req.session.user.id;

        const genres = await db.Genre.findAll({ order: [["id", "ASC"]] });
        const languages = await db.Language.findAll({ order: [["id", "ASC"]] });

        const ids = await userInterestsDao.getInterestIds(userId);
        

        var selectedGenreIds = [];
        var selectedLanguageIds = [];

        if (ids && ids.genreIds) selectedGenreIds = ids.genreIds;
        if (ids && ids.languageIds) selectedLanguageIds = ids.languageIds;

        return res.render("users/interests", {
            title: "Moji interesi",
            genres: genres,
            languages: languages,
            selectedGenreIds: selectedGenreIds,
            selectedLanguageIds: selectedLanguageIds,
            error: null,
            success: null
        });
    }

    async saveInterests(req, res) {
        const userId = req.session.user.id;

        const genres = await db.Genre.findAll({ order: [["id", "ASC"]] });
        const languages = await db.Language.findAll({ order: [["id", "ASC"]] });

        var zanrovi = req.body.zanrovi;
        var jezici = req.body.jezici;

        var genreIds = [];
        var languageIds = [];

        if (zanrovi !== undefined && zanrovi !== null) {
            if (Array.isArray(zanrovi)) {
                for (var i = 0; i < zanrovi.length; i++) {
                    var gid = Number(zanrovi[i]);
                    if (Number.isFinite(gid) && gid > 0) genreIds.push(gid);
                }
            } else {
                var gid2 = Number(zanrovi);
                if (Number.isFinite(gid2) && gid2 > 0) genreIds.push(gid2);
            }
        }

        if (jezici !== undefined && jezici !== null) {
            if (Array.isArray(jezici)) {
                for (var j = 0; j < jezici.length; j++) {
                    var lid = Number(jezici[j]);
                    if (Number.isFinite(lid) && lid > 0) languageIds.push(lid);
                }
            } else {
                var lid2 = Number(jezici);
                if (Number.isFinite(lid2) && lid2 > 0) languageIds.push(lid2);
            }
        }

        try {
            await db.sequelize.transaction(async (t) => {
                await userInterestsDao.setInterests(userId, genreIds, languageIds, t);
            });

            return res.render("users/interests", {
                title: "Moji interesi",
                genres: genres,
                languages: languages,
                selectedGenreIds: genreIds,
                selectedLanguageIds: languageIds,
                error: null,
                success: "Interesi su sačuvani."
            });
        } catch (e) {
            return res.status(400).render("users/interests", {
                title: "Moji interesi",
                genres: genres,
                languages: languages,
                selectedGenreIds: genreIds,
                selectedLanguageIds: languageIds,
                error: e.message,
                success: null
            });
        }
    }
}

module.exports = new ProfileController();