const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Conversation = sequelize.define(
    "Conversation",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        userAId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_a_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        userBId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_b_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "related_order_id",
            references: {
                model: "orders",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        zadnjaPorukaAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "last_message_at",
        },
    },

    {
        tableName: "conversations",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Conversation;