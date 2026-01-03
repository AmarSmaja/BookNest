const db = require("../models");

async function banGuard(req, res, next) {
    if (req.path.startsWith("/auth")) return next();

    let u = null;
    if (req.session && req.session.user) {
        u = req.session.user;
    }

    if (!u) return next();

    const user = await db.User.findByPk(u.id);
    if (!user) {
        return res.redirect("/auth/login");
    }

    req.session.user.status = user.status;
    req.session.user.blokiranDo = user.blokiranDo;

    if (user.status !== "Blokiran") return next();

    if (user.blokiranDo) {
        const sad = new Date();
        const preostalo = new Date(user.blokiranDo);
        if (preostalo <= sad) {
            await db.User.update(
                { status: "Aktivan", blokiranDo: null },
                { where: { id: user.id } }
            );

            req.session.user.status = "Aktivan";
            req.session.user.blokiranDo = null;
            return next();
        }
    }

    return res.status(403).render("banned", { title: "Pristup blokiran", until: user.blokiranDo });
}

module.exports = { banGuard };