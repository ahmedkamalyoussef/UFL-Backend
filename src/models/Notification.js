"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Notification extends sequelize_1.Model {
}
exports.Notification = Notification;
Notification.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
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
    title: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('WELCOME_BONUS', 'MATCH_STARTING', 'GAME_RESULT', 'WALLET_UPDATE', 'GAME_JOINED', 'GAME_STARTED', 'GAME_FINISHED', 'GAME_CANCELLED', 'GAME_REFUNDED', 'RANKING_UPDATED', 'SEASON_STARTED', 'SYSTEM'),
        allowNull: false,
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    readAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    relatedEntityType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    relatedEntityId: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'notifications',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['isRead'] },
        { fields: ['userId', 'type', 'relatedEntityId'] },
    ],
});
