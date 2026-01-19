const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },

        ime: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        prezime: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true
        },

        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        profileImageUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            field: "profile_image_url"
        },

        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: [["Admin", "Prodavac", "Kupac"]],
            },
        },

        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "Aktivan",
            validate: {
                isIn: [["Aktivan", "Deaktiviran", "Blokiran", "Arhiviran"]],
            },
        },

        blokiranDo: {
            type: DataTypes.DATE,
            allowNull: true
        },
    },
    
    {
        tableName: "users",
        underscored: true,
        timestamps: true,
    }
);

module.exports = User;