const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BookImage = sequelize.define(
    "BookImage",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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

        url: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },

        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "sort_order",
        },
    },

    {
        tableName: "book_images",
        underscored: true,
        timestamps: true,
    }
);

module.exports = BookImage;