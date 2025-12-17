const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const CartItem = sequelize.define(
    "CartItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        cartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "cart_id",
            references: {
                model: "carts",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
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

        kolicina: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1, 
            validate: {
                min: 1,
            },
            field: "qty",
        },
    },

    {
        tableName: "cart_items",
        underscored: true,
        timestamps: true,
    }
);

module.exports = CartItem;