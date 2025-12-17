const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ConversationRead = sequelize.define(
    "ConversationRead",
    {
        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "conversation_id",
            references: {
                model: "conversations",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "user_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        zadnjeProcitanoAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "last_read_at",
        },
    },

    {
        tableName: "conversation_reads",
        underscored: true,
        timestamps: true,
    }
);

module.exports = ConversationRead;