"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRanking = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class GlobalRanking extends sequelize_1.Model {
}
exports.GlobalRanking = GlobalRanking;
GlobalRanking.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    seasonId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'seasons',
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
    rankingPoints: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    gamesPlayed: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    gamesWon: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    rankPosition: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'global_rankings',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['seasonId', 'userId'] },
        { fields: ['seasonId'] },
        { fields: ['userId'] },
        { fields: ['rankingPoints'] },
    ],
});
