const db = require("../models");

class BookDao {
    async listPublic({ limit = 24, offset = 0 } = {}) {
        const sql = `
            SELECT
            b.id,
            b.naziv,
            b.autor,
            b.izdavac,
            b.publish_year AS "godinaIzdavanja",
            b.opis,
            b.cijena,
            b.is_exchangeable AS "spremnaZaRazmjenu",
            b.photo_url AS "glavnaSlikaUrl",
            b.status,
            b.created_at AS "createdAt",
            b.kolicina_dostupno AS "kolicinaDostupno",

            g.naziv AS "zanrNaziv",
            l.naziv AS "jezikNaziv",
            bc.naziv AS "stanjeNaziv",

            u.id AS "prodavacId",
            u.ime AS "prodavacIme",
            u.prezime AS "prodavacPrezime"
        FROM books b
        JOIN genres g ON g.id = b.genre_id
        JOIN languages l ON l.id = b.language_id
        JOIN book_conditions bc ON bc.id = b.condition_id
        JOIN users u ON u.id = b.seller_id
        WHERE b.status = 'Aktivna' AND b.kolicina_dostupno > 0
        ORDER BY b.created_at DESC
        LIMIT :limit OFFSET :offset;`;

        const [redovi] = await db.sequelize.query(sql, {
            replacements: { limit, offset },
        });

        return redovi;
    }

    async listRandomPublic(limit) {
        let lim = 12;

        if (limit !== undefined && limit !== null) {
            lim = Number(limit);
            if (!Number.isFinite(lim) || lim <= 0) {
                lim = 12;
            }
        }

        const sql = `
        SELECT
            b.id,
            b.naziv,
            b.autor,
            b.izdavac,
            b.publish_year AS "godinaIzdavanja",
            b.opis,
            b.cijena,
            b.is_exchangeable AS "spremnaZaRazmjenu",
            b.photo_url AS "glavnaSlikaUrl",
            b.status,
            b.created_at AS "createdAt",
            b.kolicina_dostupno AS "kolicinaDostupno",

            g.naziv AS "zanrNaziv",
            l.naziv AS "jezikNaziv",
            bc.naziv AS "stanjeNaziv",

            u.id AS "prodavacId",
            u.ime AS "prodavacIme",
            u.prezime AS "prodavacPrezime"
        FROM books b
        JOIN genres g ON g.id = b.genre_id
        JOIN languages l ON l.id = b.language_id
        JOIN book_conditions bc ON bc.id = b.condition_id
        JOIN users u ON u.id = b.seller_id
        WHERE b.status = 'Aktivna'
          AND b.kolicina_dostupno > 0
        ORDER BY RANDOM()
        LIMIT :limit;
    `;

        const rezultat = await db.sequelize.query(sql, { replacements: { limit: lim } });

        return rezultat[0];
    }

    async findPublicById(id) {
        const sql = `
            SELECT
                b.*,
                g.naziv AS "zanrNaziv",
                l.naziv AS "jezikNaziv",
                bc.naziv AS "stanjeNaziv",
                u.ime AS "prodavacIme",
                u.prezime AS "prodavacPrezime"
            FROM books b
            JOIN genres g ON g.id = b.genre_id
            JOIN languages l ON l.id = b.language_id
            JOIN book_conditions bc ON bc.id = b.condition_id
            JOIN users u ON u.id = b.seller_id
            WHERE b.id = :id
            LIMIT 1;`;

            const [redovi] = await db.sequelize.query(sql, {
                replacements: { id },
            });

            return redovi[0] || null;
    }
}

module.exports = new BookDao();