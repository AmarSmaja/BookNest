const db = require("../models");
const { getModelByType } = require("../public/javascripts/lookupRegistry");

class LookupDao {
    async getBookFormLookups() {
        const [genres, languages, conditions] = await Promise.all([
            db.Genre.findAll({ order: [["id", "ASC"]] }),
            db.Language.findAll({ order: [["id", "ASC"]] }),
            db.BookCondition.findAll({ order: [["id", "ASC"]] }),
        ]);

        return { genres, languages, conditions };
    }

    async getRegisterLookups() {
        const [genres, languages] = await Promise.all([
            db.Genre.findAll({ order: [["id", "ASC"]] }),
            db.Language.findAll({ order: [["id", "ASC"]] }),
        ]);

        return { genres, languages };
    }

    async listCities() {
        return db.City.findAll({ order: [["naziv", "ASC"]] });
    }

    getModel(type) {
        const t = String(type || "").trim();
        const Model = getModelByType(t);
        return { type: t, Model };
    }

    async list(type) {
        const { Model } = this.getModel(type);
        if (!Model) return null;
        return Model.findAll({ order: [["id", "ASC"]] });
    }

    async create(type, data) {
        const { Model } = this.getModel(type);
        if (!Model) return null;
        return Model.create(data);
    }

    async update(type, id, data) {
        const { Model } = this.getModel(type);
        if (!Model) return null;
        return Model.update(data, { where: { id: id } });
    }

    async remove(type, id) {
        const { Model } = this.getModel(type);
        if (!Model) return null;
        return Model.destroy({ where: { id: id } });
    }
}

module.exports = new LookupDao();