const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SellerProfile = sequelize.define(
    "SellerProfile",
    {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: "user_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        cityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "city_id",
            references: {
                model: "cities",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        profileImageUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
    },

    {
        tableName: "seller_profiles",
        underscored: true,
        timestamps: true,
    }
);

module.exports = SellerProfile