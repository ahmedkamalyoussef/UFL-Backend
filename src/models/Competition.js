"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Competition = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Competition extends sequelize_1.Model {
}
exports.Competition = Competition;
Competition.init({
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
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.ENUM('EPL', 'LALIGA', 'SPL', 'UCL', 'ACL', 'EGY'),
        allowNull: false,
        unique: true,
    },
    logoUrl: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'competitions',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['externalId'] },
        { unique: true, fields: ['code'] },
    ],
});
