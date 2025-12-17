const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Cart = sequelize.define(
    "Cart",
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
            onDelete: "CASCADE",
        },
    },

    {
        tableName: "carts",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Cart;