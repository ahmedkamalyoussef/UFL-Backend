"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ad = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");

class Ad extends sequelize_1.Model {
    get isExpired() {
        if (!this.endDate) return false;
        return new Date() > new Date(this.endDate);
    }
    get isEffectiveActive() {
        if (!this.isActive) return false;
        if (this.isExpired) return false;
        if (this.startDate && new Date() < new Date(this.startDate)) return false;
        return true;
    }
}
exports.Ad = Ad;

Ad.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    videoUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    linkUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    rewardCoins: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 500,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    viewsCount: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    completionsCount: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'ads',
    timestamps: true,
});

