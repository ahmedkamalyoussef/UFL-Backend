"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Season = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Season extends sequelize_1.Model {
}
exports.Season = Season;
Season.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('UPCOMING', 'ACTIVE', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'seasons',
    timestamps: true,
    indexes: [
        { fields: ['status'] },
        { fields: ['isActive'] },
    ],
});
