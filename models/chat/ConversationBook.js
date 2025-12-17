const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ConversationBook = sequelize.define(
    "ConversationBook",
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

        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "book_id",
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },

    {
        tableName: "conversation_books",
        underscored: true,
        timestamps: true,
    }
);

module.exports = ConversationBook;