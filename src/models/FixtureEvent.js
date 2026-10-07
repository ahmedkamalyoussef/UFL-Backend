"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixtureEvent = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class FixtureEvent extends sequelize_1.Model {
}
exports.FixtureEvent = FixtureEvent;
FixtureEvent.init({
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
        allowNull: true,
        references: {
            model: 'players',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    eventType: {
        type: sequelize_1.DataTypes.ENUM('GOAL', 'ASSIST', 'PASS', 'TACKLE', 'YELLOW_CARD', 'RED_CARD', 'SAVE', 'CLEAN_SHEET'),
        allowNull: false,
    },
    minute: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    detail: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'fixture_events',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['fixtureId'] },
        { fields: ['playerId'] },
    ],
});
