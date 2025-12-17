const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Genre = sequelize.define(
    "Genre",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        naziv: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
        },
    },

    {
        tableName: "genres",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Genre;