const { DataTypes } = require('sequelize');
const sequelize = require("../../config/db");

const Message = sequelize.define(
    "Message",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "conversation_id",
            references: {
                model: "conversations",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        posiljalacId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "sender_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        sadrzaj: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "body",
        },
    },

    {
        tableName: "messages",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Message;