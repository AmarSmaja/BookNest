const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SellerReview = sequelize.define(
    "SellerReview",
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
            onDelete: "RESTRICT",
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
            onDelete: "RESTRICT",
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
            field: "rating,"
        },

        komentar: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "comment",
        },
    },

    {
        tableName: "seller_reviews",
        underscored: true,
        timestamps: true,
    }
);

module.exports = SellerReview;