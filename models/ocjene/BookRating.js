const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BookRating = sequelize.define(
    "BookRating",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "book_id",
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        kupacId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "buyer_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT"
        },

        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "order_id",
            references: {
                model: "orders",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        ocjena: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
            field: "rating",
        },
    },

    {
        tableName: "book_ratings",
        underscored: true,
        timestamps: true,
    }
);

module.exports = BookRating;