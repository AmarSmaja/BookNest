const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const OrderItem = sequelize.define(
    "OrderItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "order_id",
            references: {
                model: "orders",
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
            onDelete: "RESTRICT",
        },

        cijenaUTrenutku: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                min: 0,
            },
            field: "price_at_time",
        },
    },

    {
        tableName: "order_items",
        underscored: true,
        timestamps: true,
    }
);

module.exports = OrderItem;