const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BookPickupCity = sequelize.define(
    "BookPickupCity",
    {
        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "book_id",
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        cityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: "city_id",
            references: {
                model: "cities",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
    },

    {
        tableName: "book_pickup_cities",
        underscored: true,
        timestamps: true,
    }
);

module.exports = BookPickupCity;