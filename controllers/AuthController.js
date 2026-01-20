const authService = require("../services/AuthService");

class AuthController {
    async showRegister(req, res) {
        const data = await authService.getRegisterData();
        res.render("auth/register", { error: null, genres: data.genres, languages: data.languages });
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
            const data = await authService.getRegisterData();
            return res.status(400).render("auth/register", { error: e.message, genres: data.genres, languages: data.languages });
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
        req.session.destroy(() => res.redirect("/"));
    }
}

module.exports = new AuthController();