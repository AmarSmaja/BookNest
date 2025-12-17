const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Book = sequelize.define(
    "Book",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        prodavacId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "seller_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        naziv: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        autor: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        izdavac: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        godinaIzdavanja: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "publish_year",
            validate: {
                min: 0,
            },
        },

        opis: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        zanrId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "genre_id",
            references: {
                model: "genres",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        jezikId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "language_id",
            references: {
                model: "languages",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        stanjeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "condition_id",
            references: {
                model: "book_conditions",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        cijena: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },

        spremnaZaRazmjenu: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_exchangeable",
        },

        glavnaSlikaUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            field: "photo_url",
        },

        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "Aktivna",
            validate: {
                isIn: [["Aktivna", "Rezervisana", "Prodana/Razmjenjena", "Arhivirana"]],
            },
        },
    },

    {
        tableName: "books",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Book;