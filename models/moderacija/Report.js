const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Report = sequelize.define(
    "Report",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        prijavioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "reporter_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        prijavljeniUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "target_user_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        prijavljenaKnjigaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "target_book_id",
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        razlog: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "reason",
        },

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "Otvoren",
            validate: {
                isIn: [["Otvoren", "U_obradi", "Rijesen", "Odbijen"]],
            },
        },

        rijesioAdminId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "resolved_by_admin_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },

    {
        tableName: "reports",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Report;