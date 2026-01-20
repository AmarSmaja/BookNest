const profileService = require("../services/ProfileService");

class ProfileController {
    async showInterests(req, res) {
        try {
            const userId = req.session.user.id;
            const data = await profileService.getInterestsFormData(userId);
            return res.render("users/interests", { title: "Moji interesi", 
                genres: data.genres, 
                languages: data.languages, 
                selectedGenreIds: data.selectedGenreIds, 
                selectedLanguageIds: data.selectedLanguageIds, 
                error: null, 
                success: null 
            });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async saveInterests(req, res) {
        try {
            const userId = req.session.user.id;
            const data = await profileService.saveInterests(userId, req.body);
            return res.render("users/interests", {
                title: "Moji interesi",
                genres: data.genres,
                languages: data.languages,
                selectedGenreIds: data.selectedGenreIds, 
                selectedLanguageIds: data.selectedLanguageIds,
                error: null,
                success: "Interesi su sacuvani!"
            });
        } catch (e) {
            const fallback = await profileService.getInterestsFormData(req.session.user.id);

            let selectedGenreIds = fallback.selectedGenreIds;
            let selectedLanguageIds = fallback.selectedLanguageIds;

            try {
                const normalized = profileService.normalizeInterests(req.body);
                selectedGenreIds = normalized.genreIds;
                selectedLanguageIds = normalized.languageIds;
            } catch {

            }

            return res.status(400).render("users/interests", {
                title: "Moji interesi",
                genres: fallback.genres,
                languages: fallback.languages,
                selectedGenreIds: selectedGenreIds,
                selectedLanguageIds: selectedLanguageIds,
                error: e.message,
                success: null
            });
        }
    }
}

module.exports = new ProfileController();