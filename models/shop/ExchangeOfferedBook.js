const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ExchangeOfferedBook = sequelize.define(
    "ExchangeOfferedBook",
    {
        exchangeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "exchange_id",
            references: {
                model: "exchange_requests",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "book_id",
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
    },

    {
        tableName: "exchange_offered_books",
        underscored: true, 
        timestamps: true,
    }
);

module.exports = ExchangeOfferedBook;