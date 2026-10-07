"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftTurn = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class DraftTurn extends sequelize_1.Model {
}
exports.DraftTurn = DraftTurn;
DraftTurn.init({
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
    turnNumber: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: {
            min: 1,
            max: 8,
        },
    },
    round: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: {
            min: 1,
            max: 2,
        },
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
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('PENDING', 'COMPLETED', 'TIMED_OUT'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'draft_turns',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['gameId', 'turnNumber'] },
        { fields: ['gameId'] },
        { fields: ['participantId'] },
    ],
});
