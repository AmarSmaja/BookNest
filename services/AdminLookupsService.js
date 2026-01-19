const lookupDao = require("../dao/LookupDao");
const { getTitle, getModelByType } = require("../public/javascripts/lookupRegistry");

class AdminLookupsService {
    normalizeType(typeRaw) {
        const type = String(typeRaw || "").trim();
        const Model = getModelByType(type);
        if (!Model) return null;
        
        return type;
    }

    normalizeId(idRaw) {
        const id = Number(idRaw);
        if (!Number.isFinite(id) || id <= 0) return null;
        
        return id;
    }

    normalizeNaziv(body) {
        let naziv = "";
        if (body && body.naziv != null) naziv = String(body.naziv).trim();
        
        return naziv;
    }

    async list(typeRaw) {
        const type = this.normalizeType(typeRaw);
        if (!type) throw new Error("Nepoznata lookup tabela!");

        const rows = await lookupDao.list(type);
        
        return { title: getTitle(type), type, rows };
    }

    async create(typeRaw, body) {
        const type = this.normalizeType(typeRaw);
        if (!type) throw new Error("Nepoznat tip lookup tabele!");

        const naziv = this.normalizeNaziv(body);
        if (!naziv) throw new Error("Naziv je obavezan!");

        await lookupDao.create(type, { naziv });
        
        return true;
    }

    async update(typeRaw, idRaw, body) {
        const type = this.normalizeType(typeRaw);
        if (!type) throw new Error("Nepoznat tip lookup tabele!");

        const id = this.normalizeId(idRaw);
        if (!id) throw new Error("Neispravan ID!");

        const naziv = this.normalizeNaziv(body);
        if (!naziv) throw new Error("Naziv je obavezan!");

        await lookupDao.update(type, id, { naziv });
        
        return true;
    }

    async remove(typeRaw, idRaw) {
        const type = this.normalizeType(typeRaw);
        if (!type) throw new Error("Nepoznat tip lookup tabele!");

        const id = this.normalizeId(idRaw);
        if (!id) throw new Error("Neispravan ID!");

        await lookupDao.remove(type, id);

        return true;
    }
}

module.exports = new AdminLookupsService();