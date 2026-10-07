"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Game extends sequelize_1.Model {
}
exports.Game = Game;
Game.init({
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
    status: {
        type: sequelize_1.DataTypes.ENUM('WAITING', 'DRAFTING', 'LIVE', 'FINISHED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'WAITING',
    },
    entryFee: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 500,
    },
    currentDraftTurn: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    finishedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'games',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['fixtureId'] },
        { fields: ['status'] },
    ],
});
