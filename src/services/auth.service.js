"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const models_1 = require("../models");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const email_service_1 = require("./email.service");

// In-memory store for password reset OTP codes (15 minutes validity)
const passwordResetStore = new Map();

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
                role: 'user',
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
        const token = (0, jwt_1.generateToken)({ userId: result.user.id, email: result.user.email, role: result.user.role });
        return {
            token,
            user: {
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                avatarUrl: result.user.avatarUrl,
                role: result.user.role,
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
        const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
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

    static async forgotPassword(input) {
        const email = input.email.trim().toLowerCase();
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'No account found with this email', statusCode: 404 };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        passwordResetStore.set(email, { otp, expiresAt, attempts: 0 });

        console.log(`[AUTH] Password Reset OTP for ${email}: ${otp}`);

        // Send email with OTP via nodemailer
        await email_service_1.EmailService.sendPasswordResetOtp(email, otp);

        return {
            message: 'Verification code sent to your email',
            email,
            devOtp: otp,
        };
    }

    static async resetPassword(input) {
        const email = input.email.trim().toLowerCase();
        const record = passwordResetStore.get(email);
        if (!record || Date.now() > record.expiresAt) {
            passwordResetStore.delete(email);
            throw { code: 'EXPIRED_OTP', message: 'The verification code has expired. Please request a new one.', statusCode: 400 };
        }
        if (record.otp !== input.otp.trim()) {
            record.attempts += 1;
            if (record.attempts >= 5) {
                passwordResetStore.delete(email);
                throw { code: 'MAX_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Please request a new code.', statusCode: 400 };
            }
            throw { code: 'INVALID_OTP', message: 'Invalid verification code', statusCode: 400 };
        }

        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }

        const passwordHash = await (0, password_1.hashPassword)(input.newPassword);
        user.passwordHash = passwordHash;
        await user.save();

        passwordResetStore.delete(email);

        return {
            message: 'Password has been reset successfully',
        };
    }
}
exports.AuthService = AuthService;
