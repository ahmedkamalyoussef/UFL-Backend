"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransaction = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class WalletTransaction extends sequelize_1.Model {
}
exports.WalletTransaction = WalletTransaction;
WalletTransaction.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    walletId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'wallets',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('WELCOME_BONUS', 'GAME_ENTRY', 'GAME_REWARD', 'REWARDED_AD', 'GAME_REFUND'),
        allowNull: false,
    },
    referenceId: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'wallet_transactions',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['walletId'] },
        { fields: ['walletId', 'referenceId', 'type'] },
    ],
});
