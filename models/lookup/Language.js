const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Language = sequelize.define(
    "Language", 
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
        tableName: "languages",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Language;