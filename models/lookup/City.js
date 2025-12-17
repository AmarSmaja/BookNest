const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const City = sequelize.define(
    "City",
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
        tableName: "cities",
        underscored: true,
        timestamps: true,
    }
)

module.exports = City;