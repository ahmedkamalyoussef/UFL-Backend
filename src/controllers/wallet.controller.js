"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const wallet_service_1 = require("../services/wallet.service");
const response_1 = require("../utils/response");
class WalletController {
    static async getWallet(req, res, next) {
        try {
            const userId = req.user.userId;
            const wallet = await wallet_service_1.WalletService.getWalletByUserId(userId);
            if (!wallet) {
                (0, response_1.sendError)(res, 'WALLET_NOT_FOUND', 'Wallet not found for user', 404);
                return;
            }
            (0, response_1.sendSuccess)(res, {
                balance: wallet.balance,
                careerCoins: wallet.careerCoins,
                isEligibleForRewardedAd: wallet.isEligibleForRewardedAd,
            }, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTransactions(req, res, next) {
        try {
            const userId = req.user.userId;
            const transactions = await wallet_service_1.WalletService.getTransactionsByUserId(userId);
            (0, response_1.sendSuccess)(res, transactions, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async claimAdReward(req, res, next) {
        try {
            const userId = req.user.userId;
            const wallet = await wallet_service_1.WalletService.claimAdReward(userId);
            (0, response_1.sendSuccess)(res, wallet, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WalletController = WalletController;
