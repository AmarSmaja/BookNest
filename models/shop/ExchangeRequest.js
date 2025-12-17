const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ExchangeRequest = sequelize.define(
    "ExchangeRequest",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "Na_cekanju",
            validate: {
                isIn: [["Na_cekanju", "Prihvacena", "Odbijena", "Zavrsena", "Otkazana"]],
            },

        },

        zavrsenaAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "completed_at",
        },
    },

    {
        tableName: "exchange_requests",
        underscored: true,
        timestamps: true,
    }
);

module.exports = ExchangeRequest;