"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const models_1 = require("../models");
const database_1 = require("../config/database");
class WalletService {
    static async getWalletByUserId(userId) {
        return await models_1.Wallet.findOne({ where: { userId } });
    }
    static async getTransactionsByUserId(userId) {
        const wallet = await this.getWalletByUserId(userId);
        if (!wallet) {
            throw { code: 'WALLET_NOT_FOUND', message: 'Wallet not found for user', statusCode: 404 };
        }
        return await models_1.WalletTransaction.findAll({
            where: { walletId: wallet.id },
            order: [['createdAt', 'DESC']],
        });
    }
    static async claimAdReward(userId) {
        return await database_1.sequelize.transaction(async (t) => {
            const wallet = await models_1.Wallet.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
            if (!wallet) throw { code: 'WALLET_NOT_FOUND', message: 'Wallet not found', statusCode: 404 };
            
            wallet.balance += 500;
            wallet.careerCoins += 500;
            await wallet.save({ transaction: t });

            await models_1.WalletTransaction.create({
                walletId: wallet.id,
                amount: 500,
                type: 'REWARDED_AD',
                referenceId: `ad-reward-${Date.now()}-${userId}`,
                description: 'Rewarded Ad Bonus',
            }, { transaction: t });

            return { balance: wallet.balance, careerCoins: wallet.careerCoins };
        });
    }
}
exports.WalletService = WalletService;
