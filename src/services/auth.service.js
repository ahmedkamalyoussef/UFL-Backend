"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const models_1 = require("../models");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async register(input) {
        const existingUser = await models_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [{ email: input.email }, { username: input.username }],
            },
        });
        if (existingUser) {
            if (existingUser.email === input.email) {
                throw { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists', statusCode: 409 };
            }
            else {
                throw { code: 'DUPLICATE_USERNAME', message: 'This username is already taken', statusCode: 409 };
            }
        }
        const passwordHash = await (0, password_1.hashPassword)(input.password);
        // Atomic Database Transaction for Registration + Wallet + Welcome Bonus
        const result = await database_1.sequelize.transaction(async (t) => {
            // 1. Create User
            const user = await models_1.User.create({
                username: input.username,
                email: input.email,
                passwordHash,
            }, { transaction: t });
            // 2. Create User Wallet initialized with 500 Coins
            const wallet = await models_1.Wallet.create({
                userId: user.id,
                balance: 500,
                careerCoins: 500,
            }, { transaction: t });
            // 3. Create Idempotent WELCOME_BONUS WalletTransaction
            await models_1.WalletTransaction.create({
                walletId: wallet.id,
                amount: 500,
                type: 'WELCOME_BONUS',
                referenceId: `welcome-bonus-${user.id}`,
                description: 'Welcome Bonus (+500 Coins)',
            }, { transaction: t });
            return { user, wallet };
        });
        const token = (0, jwt_1.generateToken)({ userId: result.user.id, email: result.user.email });
        return {
            token,
            user: {
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                avatarUrl: result.user.avatarUrl,
            },
            wallet: {
                balance: result.wallet.balance,
                careerCoins: result.wallet.careerCoins,
                isEligibleForRewardedAd: result.wallet.isEligibleForRewardedAd,
            },
        };
    }
    static async login(input) {
        const user = await models_1.User.findOne({ where: { email: input.email } });
        if (!user) {
            throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
        }
        const isMatch = await (0, password_1.comparePassword)(input.password, user.passwordHash);
        if (!isMatch) {
            throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
        }
        const wallet = await models_1.Wallet.findOne({ where: { userId: user.id } });
        const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
            wallet: wallet
                ? {
                    balance: wallet.balance,
                    careerCoins: wallet.careerCoins,
                    isEligibleForRewardedAd: wallet.isEligibleForRewardedAd,
                }
                : undefined,
        };
    }
}
exports.AuthService = AuthService;
