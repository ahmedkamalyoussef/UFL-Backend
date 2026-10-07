"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSelection = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PlayerSelection extends sequelize_1.Model {
}
exports.PlayerSelection = PlayerSelection;
PlayerSelection.init({
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
    participantId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'game_participants',
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
    turnNumber: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
    },
    isAutoPick: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'player_selections',
    timestamps: true,
    createdAt: 'selectedAt',
    updatedAt: false,
    indexes: [
        { unique: true, fields: ['gameId', 'playerId'] },
        { fields: ['gameId'] },
        { fields: ['participantId'] },
        { fields: ['playerId'] },
    ],
});
