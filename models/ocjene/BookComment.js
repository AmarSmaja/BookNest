const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BookComment = sequelize.define(
    "BookComment",
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

        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "order_id",
            references: {
                model: "orders",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        sadrzaj: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "content",
        },

        uredjenAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "edited_at",
        },

        obrisanAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "deleted_at",
        },
    },

    {
        tableName: "book_comments",
        underscored: true,
        timestamps: true,
    }
);

module.exports = BookComment;