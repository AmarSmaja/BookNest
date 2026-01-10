const db = require("../models");
const { QueryTypes } = require("sequelize");

class PopularBooksService {
    async listPopular(limit) {
        let lim = Number(limit);
        if (!Number.isFinite(lim) || lim <= 0) lim = 10;
        if (lim > 100) lim = 100;

        const sql = `
      SELECT
        b.id,
        b.naziv,
        b.autor,
        b.photo_url,
        b.cijena,
        b.status,
        b.seller_id AS "prodavacId",

        COALESCE(r.avg_rating, 0)       AS "prosjekOcjena",
        COALESCE(r.rating_count, 0)     AS "brojOcjena",
        COALESCE(o.completed_orders, 0) AS "brojZavrsenihNarudzbi",

        (COALESCE(r.avg_rating, 0) * 10 + COALESCE(o.completed_orders, 0)) AS "popularityScore"
      FROM books b
      LEFT JOIN (
        SELECT
          book_id,
          AVG(rating)::numeric(10,2) AS avg_rating,
          COUNT(*)::int             AS rating_count
        FROM book_ratings
        GROUP BY book_id
      ) r ON r.book_id = b.id
      LEFT JOIN (
        SELECT
          oi.book_id,
          COUNT(DISTINCT o.id)::int AS completed_orders
        FROM order_items oi
        JOIN orders o
          ON o.id = oi.order_id
         AND o.status = 'Zavrsena'
        GROUP BY oi.book_id
      ) o ON o.book_id = b.id
      ORDER BY "popularityScore" DESC, b.id DESC
      LIMIT :limit;
    `;

        const rows = await db.sequelize.query(sql, {
            replacements: { limit: lim },
            type: QueryTypes.SELECT,
        });

        const out = [];
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];

            let prosjek = null;
            if (r.prosjekOcjena != null) {
                const p = Number(r.prosjekOcjena);
                if (Number.isFinite(p)) prosjek = p;
            }

            let brojOcjena = 0;
            if (r.brojOcjena != null) {
                const n = Number(r.brojOcjena);
                if (Number.isFinite(n)) brojOcjena = n;
            }

            let brojZavrsenih = 0;
            if (r.brojZavrsenih != null) {
                const k = Number(r.brojZavrsenih);
                if (Number.isFinite(k)) brojZavrsenih = k;
            }

            out.push({
                id: r.id,
                naziv: r.naziv,
                autor: r.autor,
                glavnaSlikaUrl: r.photo_url,
                cijena: r.cijena,
                status: r.status,
                prodavacId: r.prodavacId,
                prosjekOcjena: prosjek,
                brojOcjena: brojOcjena,
                brojZavrsenihNarudzbi: brojZavrsenih,
            });
        }

        return out;
    }
}

module.exports = new PopularBooksService();