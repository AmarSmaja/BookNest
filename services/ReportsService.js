const db = require("../models");
const notificationDao = require("../dao/NotificationDao");

class ReportsService {
    async getBookForForm(bookId) {
        const id = Number(bookId);
        if (!Number.isFinite(id)) return null;

        return db.Book.findByPk(id);
    }

    async getCreateData(user, bookId) {
        if (!user) throw new Error("Nisi logovan!");

        const targetBook = await this.getBookForForm(bookId);
        if (!targetBook) throw new Error("Knjiga nije pronadjena!");

        if (Number(targetBook.prodavacId) === Number(user.id)) throw new Error("Ne mozes prijaviti svoju knjigu!");

        return { targetBook };
    }

    async createReport(user, bookId, razlog) {
        if (!user) throw new Error("Nisi logovan!");

        const id = Number(bookId);
        if (!Number.isFinite(id)) throw new Error("Neispravan ID!");

        let razlogTxt = null;
        if (razlog != null) {
            const s = String(razlog).trim();
            if (s.length > 0) {
                razlogTxt = s;
            }
        }
        if (!razlogTxt) throw new Error("Moras unijeti razlog prijave!");

        return db.sequelize.transaction(async (t) => {
            const book = await db.Book.findByPk(id, { transaction: t });
            if (!book) throw new Error("Knijga nije pronadjena!");

            if (Number(book.prodavacId) === Number(user.id)) throw new Error("Ne mozes prijaviti svoju knjigu!");

            const report = await db.Report.create({
                prijavioId: user.id,
                prijavljeniUserId: book.prodavacId,
                prijavljenaKnjigaId: book.id,
                razlog: razlogTxt,
                status: "Otvoren",
                rijesioAdminId: null,
            }, { transaction: t });

            const admini = await db.User.findAll({
                where: { role: "Admin" },
                attributes: ["id"],
                raw: true,
                transaction: t,
            });

            for (let i = 0; i < admini.length; i++) {
                const adminId = Number(admini[i].id);
                if (!Number.isFinite(adminId)) continue;

                await notificationDao.create({
                    userId: adminId,
                    tip: "Report_prijem",
                    payloadJson: {
                        reportId: report.id,
                        prijavioId: user.id,
                        targetBookId: book.id,
                        targetUserId: book.prodavacId,
                    },
                }, t);
            }

            return report;
        });
    }
}

module.exports = new ReportsService();