const db = require("../../models");

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

module.exports = { getModelByType, getTitle };