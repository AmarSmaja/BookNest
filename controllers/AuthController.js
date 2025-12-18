const authService = require("../services/AuthService");

class AuthController {
    showRegister(req, res) {
        res.render("auth/register", { error: null });
    }

    async register(req, res) {
        try {
            const ime = req.body.ime;
            const prezime = req.body.prezime;
            const email = req.body.email;
            const password = req.body.password;
            //const { ime, prezime, email, password } = req.body;
            await authService.register({ ime, prezime, email, password });
            return res.redirect("/auth/login");
        } catch (e) {
            return res.status(400).render("auth/register", { error: e.message });
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