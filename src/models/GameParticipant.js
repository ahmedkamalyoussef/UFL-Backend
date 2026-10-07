"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameParticipant = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class GameParticipant extends sequelize_1.Model {
}
exports.GameParticipant = GameParticipant;
GameParticipant.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    gameId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'games',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    userId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    draftPosition: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: {
            min: 1,
            max: 4,
        },
    },
    totalPoints: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    finalRank: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        validate: {
            min: 1,
            max: 4,
        },
    },
    coinReward: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    rpChange: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'game_participants',
    timestamps: true,
    createdAt: 'joinedAt',
    updatedAt: false,
    indexes: [
        { unique: true, fields: ['gameId', 'userId'] },
        { fields: ['gameId'] },
        { fields: ['userId'] },
    ],
});
