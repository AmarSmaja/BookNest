const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Notification = sequelize.define(
    "Notification",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        tip: {
            type: DataTypes.STRING(40),
            allowNull: false,
            field: "type",
            validate: {
                isIn: [["Nova_narudzba",
                    "Status_narudzbe",
                    "Nova_razmjena",
                    "Status_razmjene",
                    "Nova_poruka",
                    "Nova_ocjena_knjige",
                    "Novi_komentar_knjige",
                    "Nova_ocjena_prodavaca",
                    "Report_prijem",
                    "Report_rijesen",
                ]],
            },
        },

        payloadJson: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: "payload_json",
        },

        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_read"
        },
    },

    {
        tableName: "notifications",
        underscored: true,
        timestamps: true,
    }
);

module.exports = Notification;