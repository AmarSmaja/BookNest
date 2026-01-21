const orderItemDao = require("../dao/OrderDao");

function toBool(v) {
    return v === true || v === 1 || v === "1" || v === "true";
}

class BookAccessService {
    async computeAccess(currentUser, knjiga) {
        let vidljivo = true;

        if (knjiga.status !== "Aktivna") {
            vidljivo = false;

            if (currentUser) {
                if (currentUser.role === "Admin") vidljivo = true;
                if (Number(currentUser.id) === Number(knjiga.prodavacId)) vidljivo = true;

                if (!vidljivo) {
                    const orderItem = await orderItemDao.findFinishedByBuyerForBook(currentUser.id, knjiga.id);
                    if (orderItem) vidljivo = true;
                }
            }
        }

        let izbaci404 = false;
        if (knjiga.status === "Arhivirana") {
            if (!currentUser || currentUser.role !== "Admin") izbaci404 = true;
        }

        let isAdmin = !!(currentUser && currentUser.role === "Admin");
        let canBuy = false;
        let canExchange = false;
        let canReport = false;
        let canChat = false;

        if (currentUser) {
            const nijeMoja = (Number(currentUser.id) !== Number(knjiga.prodavacId));
            const aktivna = (knjiga.status === "Aktivna");
            const exchangeable = toBool(knjiga.spremnaZaRazmjenu);

            if (nijeMoja && aktivna) {
                canBuy = true;
                canReport = true;
                canChat = true;
                if (exchangeable) canExchange = true;
            }
        }

        return { vidljivo, izbaci404, canBuy, canExchange, canReport, canChat, isAdmin };
    }
}

module.exports = new BookAccessService();