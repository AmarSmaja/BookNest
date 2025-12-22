function attachUser(req, _res, next) {
    req.user = req.session?.user || null;
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