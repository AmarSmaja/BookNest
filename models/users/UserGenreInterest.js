const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const UserGenreInterest = sequelize.define(
    "UserGenreInterest",
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

        genreId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "genre_id",
            references: { model: "genres", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "user_genre_interests",
        underscored: true,
        timestamps: false,
    }
);

module.exports = UserGenreInterest;