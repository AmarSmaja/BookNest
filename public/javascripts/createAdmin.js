require("dotenv").config();
const bcrypt = require("bcryptjs");
const userDao = require("../../dao/UserDao");
const db = require("../../models");

(async () => {
    try {
        await db.sequelize.authenticate();

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error("Admin Email i Admin Password moraju biti postavljeni u .env");
        }

        const postoji = await userDao.findByEmail(email);
        if (postoji) console.log("Admin vec postoji: ", email);

        const passwordHash = await bcrypt.hash(password, 10);

        await userDao.create({
            ime: "Admin",
            prezime: "BookNest",
            email,
            passwordHash,
            role: "Admin",
            status: "Aktivan",
            blokiranDo: null,
        });

        console.log("Admin kreiran: ", email);
    } catch (e) {
        console.error(e.message);
    }
})();