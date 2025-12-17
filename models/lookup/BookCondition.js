const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BookCondition = sequelize.define(
    "BookCondition",
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
        tableName: "book_conditions",
        underscored: true,
        timestamps: true,
    }
);

module.exports = BookCondition;