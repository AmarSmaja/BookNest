const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BookTag = sequelize.define(
    "BookTag",
    {
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

        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "tag_id",
            references: {
                model: "tags",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
    },

    {
        tableName: "book_tags",
        underscored: true,
        timestamps: true,
    }
);

module.exports = BookTag;