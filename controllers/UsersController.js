const userService = require("../services/UserService");

class UsersController {
    async me(req, res) {
        try {
            const me = await userService.getMe(req.session.user);
            return res.render("users/me", { title: "Moj profil", me: me, error: null, ok: null });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async editMe(req, res) {
        try {
            const me = await userService.getMe(req.session.user);
            return res.render("users/edit", { title: "Uredi profil", me: me, error: null });
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    async updateMe(req, res) {
        try {
            console.log("BODY:", req.body);
            console.log("profileImageUrl from body:", req.body.profileImageUrl);
            await userService.updateMe(req.session.user, req.body);

            const fresh = await userService.getMe(req.session.user);
            req.session.user.ime = fresh.ime;
            req.session.user.prezime = fresh.prezime;
            req.session.user.profileImageUrl = fresh.profileImageUrl;

            return res.redirect("/users/me");
        } catch (e) {
            try {
                const me = await userService.getMe(req.session.user);
                return res.status(400).render("users/edit", { title: "Uredi profil", me: me, error: e.message });
            } catch (e2) {
                return res.status(400).send(e.message);
            }
        }
    }

    async changePassword(req, res) {
        try {
            await userService.changePassword(req.session.user, req.body);
            const me = await userService.getMe(req.session.user);
            return res.render("users/me", { title: "Moj profil", me: me, error: null, ok: "Sifra je uspjesno promjenjena!" });
        } catch (e) {
            try {
                const me = await userService.getMe(req.session.user);
                return res.status(400).render("users/me", { title: "Moj profil", me: me, error: e.message, ok: null });
            } catch (e2) {
                return res.status(400).send(e.message);
            }
        }
    }

    async publicProfile(req, res) {
        const u = await userService.getPublicProfile(req.params.id);
        if (!u) return res.status(404).send("Korisnik nije pronadjen!");
        return res.render("users/public", { title: "Profil korisnika", profil: u, error: null });
    }
}

module.exports = new UsersController();