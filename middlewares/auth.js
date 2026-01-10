function attachUser(req, res, next) {
    var u = null;

    if (req.session && req.session.user) {
        u = req.session.user;
    }

    req.user = u;
    res.locals.user = u;

    var isAdmin = false;
    var isSeller = false;
    var isBuyer = false;

    if (u && u.role === "Admin") isAdmin = true;
    if (u && u.role === "Prodavac") isSeller = true;
    if (u && u.role === "Kupac") isBuyer = true;

    res.locals.isAdmin = isAdmin;
    res.locals.isSeller = isSeller;
    res.locals.isBuyer = isBuyer;

    next();
}

function requireAuth(req, res, next) {
    if (!req.session?.user) return res.redirect("/auth/login");
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session?.user) return res.redirect("/auth/login");
        
        if (req.session.user.role !== role) return res.status(403).send("Nemate pristup.");
        
        next();
    };
}

function requireRoles(roles = []) {
    return (req, res, next) => {
        const u = req.session?.user;
        if (!u) return res.redirect("/auth/login");

        const ok = roles.includes(u.role);
        if (!ok) return res.status(403).send("Nemate permisije!");

        next();
    }
}

module.exports = { attachUser, requireAuth, requireRole, requireRoles };