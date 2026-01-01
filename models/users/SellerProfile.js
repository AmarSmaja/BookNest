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

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "PENDING",
        },

        requestedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "requested_at",
            defaultValue: DataTypes.NOW,
        },

        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "reviewed_at",
        },
    },

    {
        tableName: "seller_profiles",
        underscored: true,
        timestamps: true,
    }
);

module.exports = SellerProfile