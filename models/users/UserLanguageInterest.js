const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const UserLanguageInterest = sequelize.define(
    "UserLanguageInterest",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "user_id",
            references: { model: "users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        languageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "language_id",
            references: { model: "languages", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "user_language_interests",
        underscored: true,
        timestamps: false,
    }
);

module.exports = UserLanguageInterest;