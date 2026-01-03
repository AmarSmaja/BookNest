const db = require("../models");
const notificationDao = require("../dao/NotificationDao");

const STATUS = {
    OTVOREN: "Otvoren",
    U_OBRADI: "U_obradi",
    RIJESEN: "Rijesen",
    ODBIJEN: "Odbijen",
};

function statusValidan(s) {
    if (!s) return false;
    if (s === STATUS.OTVOREN) return true;
    if (s === STATUS.U_OBRADI) return true;
    if (s === STATUS.RIJESEN) return true;
    if (s === STATUS.ODBIJEN) return true;
    return false;
}

function dozvoljenPrijelaz(from, to) {
    if (!statusValidan(to)) return false;

    if (from === STATUS.RIJESEN) return false;
    if (from === STATUS.ODBIJEN) return false;

    if (from === STATUS.OTVOREN) {
        if (to === STATUS.U_OBRADI) return true;
        if (to === STATUS.RIJESEN) return true;
        if (to === STATUS.ODBIJEN) return true;
        return false;
    }

    if (from === STATUS.U_OBRADI) {
        if (to === STATUS.RIJESEN) return true;
        if (to === STATUS.ODBIJEN) return true;
        return false;
    }

    return false;
}

class AdminReportsService {
    async listOpen() {
        return db.Report.findAll({
            where: { status: [STATUS.OTVOREN, STATUS.U_OBRADI], },
            order: [["id", "DESC"]],
        });
    }

    async getDetail(reportId) {
        const id = Number(reportId);
        if (!Number.isFinite(id)) return null;

        const report = await db.Report.findByPk(id);
        if (!report) return null;

        let targetBook = null;
        if (report.prijavljenaKnjigaId != null) {
            targetBook = await db.Book.findByPk(report.prijavljenaKnjigaId);
        }

        let targetUser = null;
        if (report.prijavljeniUserId != null) {
            targetUser = await db.User.findByPk(report.prijavljeniUserId);
        }

        return { report: report, targetBook: targetBook, targetUser: targetUser };
    }

    async changeStatus(adminUser, reportId, noviStatus) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const id = Number(reportId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID reporta!");

        let status = null;
        if (noviStatus != null) {
            const s = String(noviStatus).trim();
            if (s.length > 0) {
                status = s;
            }
        }

        if (!statusValidan(status)) throw new Error("Neispravan status!");

        return db.sequelize.transaction(async (t) => {
            const report = await db.Report.findByPk(id, { transaction: t });
            if (!report) throw new Error("Report nije pronadjen!");

            if (!dozvoljenPrijelaz(report.status, status)) {
                throw new Error(`Nije dozvoljen prijelaz ${report.status} -> ${status}`);
            }

            let rijesioAdminId = report.rijesioAdminId;
            if (status === STATUS.RIJESEN || status === STATUS.ODBIJEN) {
                rijesioAdminId = adminUser.id;
            }

            await db.Report.update(
                { status: status, rijesioAdminId: rijesioAdminId },
                { where: { id: id }, transaction: t }
            );

            if (status === STATUS.RIJESEN || status === STATUS.ODBIJEN) {
                await notificationDao.create({
                    userId: report.prijavioId,
                    tip: "Report_rijesen",
                    payloadJson: { reportId: id, status: status },
                }, t);
            }

            return true;
        });
    }

    async arhivirajKnjigu(adminUser, reportId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const id = Number(reportId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID reporta!");

        return db.sequelize.transaction(async (t) => {
            const report = await db.Report.findByPk(id, { transaction: t });
            if (!report) throw new Error("Report nije pronadjen!");

            if (report.prijavljenaKnjigaId == null) throw new Error("Ovaj report nema target knjigu!");

            const book = await db.Book.findByPk(report.prijavljenaKnjigaId, { transaction: t });
            if (!book) throw new Error("Knjiga nije pronadjena!");

            await db.Book.update(
                { status: "Arhivirana" },
                { where: { id: book.id }, transaction: t }
            );

            return true;
        });
    }

    async aktivirajKnjigu(adminUser, reportId) {
        if (!adminUser || adminUser.role !== "Admin") throw new Error("Nemate pristup!");

        const id = Number(reportId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID reporta!");

        return db.sequelize.transaction(async (t) => {
            const report = await db.Report.findByPk(id, { transaction: t });
            if (!report) throw new Error("Report nije pronadjen!");

            if (report.prijavljenaKnjigaId == null) throw new Error("Ovaj report nema target knjigu!");

            const book = await db.Book.findByPk(report.prijavljenaKnjigaId, { transaction: t });
            if (!book) throw new Error("Knjiga nije pronadjena!");

            await db.Book.update(
                { status: "Aktivna" },
                { where: { id: book.id }, transaction: t }
            );

            return true;
        });
    }
}

module.exports = new AdminReportsService();