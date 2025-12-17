const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Tag = sequelize.define(
    "Tag",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        naziv: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        isGlobal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: "is_global",
        },
    },

    {
        tableName: "tags",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Tag;