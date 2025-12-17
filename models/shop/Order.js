const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Order = sequelize.define(
    "Order",
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

        tip: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "Prodaja",
            validate: {
                isIn: [["Prodaja", "Razmjena"]],
            },
            field: "type",
        },

        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "Na_cekanju",
            validate: {
                isIn: [["Na_cekanju", "Prihvacena", "Odbijena", "Zavrsena", "Otkazana"]],
            },
        },

        ukupnaCijena: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                min: 0,
            },
            field: "total_price",
        },

        zavrsenaAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "completed_at",
        },
    },

    {
        tableName: "orders",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Order;