"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Wallet extends sequelize_1.Model {
    get isEligibleForRewardedAd() {
        return this.balance === 0;
    }
}
exports.Wallet = Wallet;
Wallet.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    balance: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 500,
    },
    careerCoins: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 500,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'wallets',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId'] },
    ],
});
