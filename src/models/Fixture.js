"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fixture = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Fixture extends sequelize_1.Model {
}
exports.Fixture = Fixture;
Fixture.init({
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
    competitionId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'competitions',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    homeTeamId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'teams',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    awayTeamId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'teams',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    homeScore: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    awayScore: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    elapsed: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'CANCELLED', 'SUSPENDED', 'POSTPONED'),
        allowNull: false,
        defaultValue: 'SCHEDULED',
    },
    startTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'fixtures',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['externalId'] },
        { fields: ['competitionId'] },
        { fields: ['status'] },
        { fields: ['startTime'] },
    ],
});
