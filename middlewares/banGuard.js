const db = require("../models");

async function banGuard(req, res, next) {
    if (req.path && req.path.startsWith("/auth")) return next();

    if (!req.session) return next();
    if (!req.session.user) return next();
    if (req.session.user.id == null) return next();

    const userId = Number(req.session.user.id);
    if (!Number.isFinite(userId)) return next();

    const user = await db.User.findByPk(userId);
    if (!user) return res.redirect("/auth/login");

    if (user.status !== "Blokiran") return next();

    if (user.blokiranDo) {
        const sad = new Date();
        const preostalo = new Date(user.blokiranDo);

        if (preostalo <= sad) {
            await db.User.update(
                { status: "Aktivan", blokiranDo: null },
                { where: { id: user.id } }
            );
            return next();
        }
    }

    return res.status(403).render("banned", { title: "Pristup blokiran", until: user.blokiranDo });
}

module.exports = { banGuard };