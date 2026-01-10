const profileService = require("../services/ProfileService");

class ProfileController {
    async showInterests(req, res) {
        var userId = req.session.user.id;

        const data = await profileService.getInterestsFormData(userId);

        var selectedGenres = {};
        for (var i = 0; i < data.selectedGenreIds.length; i++) {
            selectedGenres[String(data.selectedGenreIds[i])] = true;
        }

        var selectedLanguages = {};
        for (var j = 0; j < data.selectedLanguageIds.length; j++) {
            selectedLanguages[String(data.selectedLanguageIds[j])] = true;
        }

        return res.render("users/interests", {
            title: "Moji interesi",
            genres: data.genres,
            languages: data.languages,
            selectedGenres: selectedGenres,
            selectedLanguages: selectedLanguages,
            error: null,
            success: null,
        });
    }

    async saveInterests(req, res) {
        try {
            var userId = req.session.user.id;

            var zanrovi = req.body.zanrovi;
            var jezici = req.body.jezici;

            await profileService.updateInterests(userId, zanrovi, jezici);

            const data = await profileService.getInterestsFormData(userId);

            var selectedGenres = {};
            for (var i = 0; i < data.selectedGenreIds.length; i++) {
                selectedGenres[String(data.selectedGenreIds[i])] = true;
            }

            var selectedLanguages = {};
            for (var j = 0; j < data.selectedLanguageIds.length; j++) {
                selectedLanguages[String(data.selectedLanguageIds[j])] = true;
            }

            return res.render("users/interests", {
                title: "Moji interesi",
                genres: data.genres,
                languages: data.languages,
                selectedGenres: selectedGenres,
                selectedLanguages: selectedLanguages,
                error: null,
                success: "Interesi su sačuvani.",
            });
        } catch (e) {
            var userId2 = req.session.user.id;
            const data2 = await profileService.getInterestsFormData(userId2);

            var selectedGenres2 = {};
            for (var a = 0; a < data2.selectedGenreIds.length; a++) {
                selectedGenres2[String(data2.selectedGenreIds[a])] = true;
            }

            var selectedLanguages2 = {};
            for (var b = 0; b < data2.selectedLanguageIds.length; b++) {
                selectedLanguages2[String(data2.selectedLanguageIds[b])] = true;
            }

            return res.status(400).render("users/interests", {
                title: "Moji interesi",
                genres: data2.genres,
                languages: data2.languages,
                selectedGenres: selectedGenres2,
                selectedLanguages: selectedLanguages2,
                error: e.message,
                success: null, });
        }
    }
}

module.exports = new ProfileController();