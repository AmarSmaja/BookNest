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

    async listPopularPublic(limit) {
    var lim = 6;

    if (limit !== undefined && limit !== null) {
        lim = Number(limit);
        if (!Number.isFinite(lim) || lim <= 0) {
            lim = 6;
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
            u.prezime AS "prodavacPrezime",

            COALESCE(AVG(br.rating), 0) AS "prosjekOcjena",
            COUNT(br.id) AS "brojOcjena",
            COUNT(DISTINCT o.id) AS "brojZavrsenihNarudzbi"

        FROM books b
        JOIN genres g ON g.id = b.genre_id
        JOIN languages l ON l.id = b.language_id
        JOIN book_conditions bc ON bc.id = b.condition_id
        JOIN users u ON u.id = b.seller_id

        LEFT JOIN book_ratings br ON br.book_id = b.id
        LEFT JOIN order_items oi ON oi.book_id = b.id
        LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'Zavrsena'

        WHERE b.status = 'Aktivna'
          AND b.kolicina_dostupno > 0

        GROUP BY
            b.id,
            g.naziv,
            l.naziv,
            bc.naziv,
            u.id,
            u.ime,
            u.prezime

        ORDER BY
            (COALESCE(AVG(br.rating), 0) * 10 + COUNT(DISTINCT o.id)) DESC,
            b.created_at DESC

        LIMIT :limit;
    `;

        const rezultat = await db.sequelize.query(sql, {
            replacements: { limit: lim },
        });

        return rezultat[0];
    }

    async listRecommendedByInterest(genreIds, languageIds, limit) {
    var lim = 6;

    if (limit !== undefined && limit !== null) {
        lim = Number(limit);
        if (!Number.isFinite(lim) || lim <= 0) lim = 6;
    }

    var hasGenres = genreIds && genreIds.length > 0;
    var hasLangs = languageIds && languageIds.length > 0;

    if (!hasGenres && !hasLangs) {
        return [];
    }

    var replacements = { limit: lim };

    var whereParts = [];

    if (hasGenres) {
        var gParts = [];
        for (var i = 0; i < genreIds.length; i++) {
            var key = "g" + i;
            gParts.push(":" + key);
            replacements[key] = Number(genreIds[i]);
        }
        whereParts.push("b.genre_id IN (" + gParts.join(", ") + ")");
    }

    if (hasLangs) {
        var lParts = [];
        for (var j = 0; j < languageIds.length; j++) {
            var key2 = "l" + j;
            lParts.push(":" + key2);
            replacements[key2] = Number(languageIds[j]);
        }
        whereParts.push("b.language_id IN (" + lParts.join(", ") + ")");
    }

    var interestsWhere = "";
    if (whereParts.length === 2) {
        interestsWhere = "(" + whereParts[0] + " OR " + whereParts[1] + ")";
    } else {
        interestsWhere = "(" + whereParts[0] + ")";
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
          AND ${interestsWhere}
        ORDER BY RANDOM()
        LIMIT :limit;
    `;

    const rezultat = await db.sequelize.query(sql, { replacements: replacements });
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