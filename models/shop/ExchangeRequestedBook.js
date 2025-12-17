const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ExchangeRequestedBook = sequelize.define(
    "ExchangeRequestedBook",
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
        tableName: "exchange_requested_books",
        underscored: true,
        timestamps: true,
    }
);

module.exports = ExchangeRequestedBook;