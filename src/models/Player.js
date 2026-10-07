"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Player extends sequelize_1.Model {
}
exports.Player = Player;
Player.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    externalId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
    },
    teamId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'teams',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    position: {
        type: sequelize_1.DataTypes.ENUM('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER'),
        allowNull: false,
    },
    photoUrl: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    isStar: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    avgPoints: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'players',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['externalId'] },
        { fields: ['teamId'] },
        { fields: ['avgPoints'] },
    ],
});
