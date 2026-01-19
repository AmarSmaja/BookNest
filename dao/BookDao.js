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

    async searchPublic(filters) {
        var limit = 24;
        var offset = 0;

        if (filters && filters.limit !== undefined && filters.limit !== null) {
            limit = Number(filters.limit);
            if (!Number.isFinite(limit) || limit <= 0) limit = 24;
        }

        if (filters && filters.offset !== undefined && filters.offset !== null) {
            offset = Number(filters.offset);
            if (!Number.isFinite(offset) || offset < 0) offset = 0;
        }

        var whereParts = [];
        var repl = { limit: limit, offset: offset };

        whereParts.push("b.status = 'Aktivna'");
        whereParts.push("b.kolicina_dostupno > 0");

        if (filters && filters.q !== undefined && filters.q !== null) {
            var q = String(filters.q).trim();
            if (q.length > 0) {
                repl.q = "%" + q + "%";
                whereParts.push("(b.naziv ILIKE :q OR b.autor ILIKE :q OR b.izdavac ILIKE :q)");
            }
        }

        if (filters && filters.genreId !== undefined && filters.genreId !== null) {
            var gid = Number(filters.genreId);
            if (Number.isFinite(gid) && gid > 0) {
                repl.genreId = gid;
                whereParts.push("b.genre_id = :genreId");
            }
        }

        if (filters && filters.languageId !== undefined && filters.languageId !== null) {
            var lid = Number(filters.languageId);
            if (Number.isFinite(lid) && lid > 0) {
                repl.languageId = lid;
                whereParts.push("b.language_id = :languageId");
            }
        }

        if (filters && filters.conditionId !== undefined && filters.conditionId !== null) {
            var cid = Number(filters.conditionId);
            if (Number.isFinite(cid) && cid > 0) {
                repl.conditionId = cid;
                whereParts.push("b.condition_id = :conditionId");
            }
        }

        if (filters && filters.exchangeable !== undefined && filters.exchangeable !== null) {
            var ex = String(filters.exchangeable);
            if (ex === "1") whereParts.push("b.is_exchangeable = true");
            if (ex === "0") whereParts.push("b.is_exchangeable = false");
        }

        if (filters && filters.minPrice !== undefined && filters.minPrice !== null) {
            var rawMin = String(filters.minPrice).trim();
            if (rawMin.length > 0) {
                var minp = Number(rawMin);
                if (Number.isFinite(minp) && minp >= 0) {
                    repl.minPrice = minp;
                    whereParts.push("b.cijena >= :minPrice");
                }
            }
        }

        if (filters && filters.maxPrice !== undefined && filters.maxPrice !== null) {
            var rawMax = String(filters.maxPrice).trim();
            if (rawMax.length > 0) {
                var maxp = Number(rawMax);
                if (Number.isFinite(maxp) && maxp >= 0) {
                    repl.maxPrice = maxp;
                    whereParts.push("b.cijena <= :maxPrice");
                }
            }
        }

        var whereSql = "WHERE " + whereParts.join(" AND ");

        var avgRatingSql = "(SELECT COALESCE(AVG(br.rating), 0) FROM book_ratings br WHERE br.book_id = b.id)";
        var countRatingsSql = "(SELECT COUNT(*) FROM book_ratings br2 WHERE br2.book_id = b.id)";
        var countCompletedOrdersSql =
            "(SELECT COUNT(DISTINCT o.id) " +
            " FROM order_items oi " +
            " JOIN orders o ON o.id = oi.order_id " +
            " WHERE oi.book_id = b.id AND o.status = 'Zavrsena')";

        var orderBy = "b.created_at DESC";

        if (filters && filters.sort !== undefined && filters.sort !== null) {
            var s = String(filters.sort);
            if (s === "price_asc") orderBy = "b.cijena ASC, b.created_at DESC";
            else if (s === "price_desc") orderBy = "b.cijena DESC, b.created_at DESC";
            else if (s === "name_asc") orderBy = "b.naziv ASC, b.created_at DESC";
            else if (s === "popular") {
                orderBy = "(" + avgRatingSql + " * 10 + " + countCompletedOrdersSql + ") DESC, b.created_at DESC";
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

                ${avgRatingSql} AS "prosjekOcjena",
                ${countRatingsSql} AS "brojOcjena",
                ${countCompletedOrdersSql} AS "brojZavrsenihNarudzbi"

            FROM books b
            JOIN genres g ON g.id = b.genre_id
            JOIN languages l ON l.id = b.language_id
            JOIN book_conditions bc ON bc.id = b.condition_id
            JOIN users u ON u.id = b.seller_id

            ${whereSql}

            ORDER BY ${orderBy}
            LIMIT :limit OFFSET :offset;
            `;

        const rezultat = await db.sequelize.query(sql, { replacements: repl });
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
                u.prezime AS "prodavacPrezime",
                b.is_exchangeable AS "spremnaZaRazmjenu"
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

    findById(id, t) {
        const opts = {};
        if (t) opts.transaction = t;
        return db.Book.findByPk(id, opts);
    }
}

module.exports = new BookDao();