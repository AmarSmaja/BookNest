const db = require("../models");

function getModelByType(type) {
    if (type === "genres") return db.Genre;
    if (type === "languages") return db.Language;
    if (type === "conditions") return db.BookCondition;
    if (type === "tags") return db.Tag;
    if (type === "cities") return db.City;
    return null;
}

function getTitle(type) {
    if (type === "genres") return "Žanrovi";
    if (type === "languages") return "Jezici";
    if (type === "conditions") return "Stanja knjiga";
    if (type === "tags") return "Tagovi";
    if (type === "cities") return "Gradovi";
    return "Lookup";
}

async function list(req, res) {
    var type = String(req.params.type || "");
    var Model = getModelByType(type);

    if (!Model) {
        return res.status(404).send("Nepoznat lookup tip.");
    }

    const rows = await Model.findAll({ order: [["id", "ASC"]] });

    return res.render("admin/lookups", {
        title: getTitle(type),
        type: type,
        rows: rows,
        error: null,
    });
}

async function create(req, res) {
    var type = String(req.params.type || "");
    var Model = getModelByType(type);

    if (!Model) {
        return res.status(404).send("Nepoznat lookup tip.");
    }

    var naziv = "";
    if (req.body && req.body.naziv !== undefined && req.body.naziv !== null) {
        naziv = String(req.body.naziv).trim();
    }

    if (naziv.length === 0) {
        const rows = await Model.findAll({ order: [["id", "ASC"]] });
        return res.status(400).render("admin/lookups", {
            title: getTitle(type),
            type: type,
            rows: rows,
            error: "Naziv je obavezan.",
        });
    }

    await Model.create({ naziv: naziv });
    return res.redirect("/admin/lookups/" + type);
}

async function update(req, res) {
    var type = String(req.params.type || "");
    var Model = getModelByType(type);

    if (!Model) {
        return res.status(404).send("Nepoznat lookup tip.");
    }

    var id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).send("Neispravan ID.");
    }

    var naziv = "";
    if (req.body && req.body.naziv !== undefined && req.body.naziv !== null) {
        naziv = String(req.body.naziv).trim();
    }

    if (naziv.length === 0) {
        const rows = await Model.findAll({ order: [["id", "ASC"]] });
        return res.status(400).render("admin/lookups", {
            title: getTitle(type),
            type: type,
            rows: rows,
            error: "Naziv je obavezan.",
        });
    }

    await Model.update({ naziv: naziv }, { where: { id: id } });
    return res.redirect("/admin/lookups/" + type);
}

async function remove(req, res) {
    var type = String(req.params.type || "");
    var Model = getModelByType(type);

    if (!Model) {
        return res.status(404).send("Nepoznat lookup tip.");
    }

    var id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).send("Neispravan ID.");
    }

    await Model.destroy({ where: { id: id } });
    return res.redirect("/admin/lookups/" + type);
}

module.exports = {
    list: list,
    create: create,
    update: update,
    remove: remove,
};