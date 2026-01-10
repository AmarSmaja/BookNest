const db = require("../models");
const authService = require("../services/AuthService");

class AuthController {
    async showRegister(req, res) {
        const genres = await db.Genre.findAll({ order: [["id", "ASC"]] });
        const languages = await db.Language.findAll({ order: [["id", "ASC"]] });

        res.render("auth/register", { error: null, genres: genres, languages: languages });
    }

    async register(req, res) {
        try {
            const ime = req.body.ime;
            const prezime = req.body.prezime;
            const email = req.body.email;
            const password = req.body.password;

            const zanrovi = req.body.zanrovi;
            const jezici = req.body.jezici;

            await authService.register({ ime, prezime, email, password, zanrovi, jezici });
            return res.redirect("/auth/login");
        } catch (e) {
            const genres = await db.Genre.findAll({ order: [["id", "ASC"]] });
            const languages = await db.Language.findAll({ order: [["id", "ASC"]] });

            return res.status(400).render("auth/register", { error: e.message, genres: genres, languages: languages });
        }
    }

    showLogin(req, res) {
        res.render("auth/login", { error: null });
    }

    async login(req,res) {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const user = await authService.login({ email, password });

            req.session.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                ime: user.ime, 
                prezime: user.prezime,
            };

            if (user.role === "Admin") return res.redirect("/admin/users");
            return res.redirect("/");
        } catch (e) {
            return res.status(400).render("auth/login", { error: e.message });
        }
    }

    logout(req, res) {
        req.session.destroy(() => res.redirect("/auth/login"));
    }
}

module.exports = new AuthController();