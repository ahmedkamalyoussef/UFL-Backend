"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerMatchStatistic = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PlayerMatchStatistic extends sequelize_1.Model {
}
exports.PlayerMatchStatistic = PlayerMatchStatistic;
PlayerMatchStatistic.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    fixtureId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'fixtures',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    playerId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'players',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    goals: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    assists: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    bigChancesCreated: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    successfulPasses: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    failedPasses: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    tackles: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    yellowCards: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    redCards: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    cleanSheet: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    saves: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    minutesPlayed: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    totalFantasyPoints: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'player_match_statistics',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['fixtureId', 'playerId'] },
        { fields: ['fixtureId'] },
        { fields: ['playerId'] },
    ],
});
