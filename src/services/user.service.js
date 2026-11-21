"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const models_1 = require("../models");
const password_1 = require("../utils/password");

class UserService {
    static async getUserProfile(userId) {
        const user = await models_1.User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'avatarUrl', 'role', 'createdAt'],
            include: [
                {
                    model: models_1.Wallet,
                    as: 'wallet',
                    attributes: ['balance', 'careerCoins'],
                },
            ],
        });
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }
        const wallet = user.get('wallet');
        const ranking = await models_1.GlobalRanking.findOne({ where: { userId } });
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
            createdAt: user.createdAt,
            wallet: wallet
                ? {
                    balance: wallet.balance,
                    careerCoins: wallet.careerCoins,
                    isEligibleForRewardedAd: wallet.balance === 0,
                }
                : null,
            stats: ranking
                ? {
                    rankingPoints: ranking.rankingPoints,
                    gamesPlayed: ranking.gamesPlayed,
                    gamesWon: ranking.gamesWon,
                    rankPosition: ranking.rankPosition || 1,
                }
                : {
                    rankingPoints: 1000,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    rankPosition: 1,
                },
        };
    }

    static async updateAvatar(userId, avatarUrl) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }
        user.avatarUrl = avatarUrl;
        await user.save();
        return this.getUserProfile(userId);
    }

    static async updateProfile(userId, input) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }
        if (input.username && input.username !== user.username) {
            const existing = await models_1.User.findOne({
                where: {
                    username: input.username,
                    id: { [sequelize_1.Op.ne]: userId },
                },
            });
            if (existing) {
                throw { code: 'DUPLICATE_USERNAME', message: 'This username is already taken', statusCode: 409 };
            }
            user.username = input.username;
        }
        if (input.avatarUrl !== undefined) {
            user.avatarUrl = input.avatarUrl;
        }
        await user.save();
        return this.getUserProfile(userId);
    }

    static async changePassword(userId, input) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }
        const isMatch = await (0, password_1.comparePassword)(input.currentPassword, user.passwordHash);
        if (!isMatch) {
            throw { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect', statusCode: 400 };
        }
        const passwordHash = await (0, password_1.hashPassword)(input.newPassword);
        user.passwordHash = passwordHash;
        await user.save();
        return {
            message: 'Password changed successfully',
        };
    }

    static async deleteAccount(userId, password) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }
        if (password) {
            const isMatch = await (0, password_1.comparePassword)(password, user.passwordHash);
            if (!isMatch) {
                throw { code: 'INVALID_PASSWORD', message: 'Password is incorrect', statusCode: 400 };
            }
        }

        await database_1.sequelize.transaction(async (t) => {
            const wallet = await models_1.Wallet.findOne({ where: { userId }, transaction: t });
            if (wallet) {
                await models_1.WalletTransaction.destroy({ where: { walletId: wallet.id }, transaction: t });
                await wallet.destroy({ transaction: t });
            }
            await models_1.GlobalRanking.destroy({ where: { userId }, transaction: t });
            await models_1.Notification.destroy({ where: { userId }, transaction: t });
            await models_1.GameParticipant.destroy({ where: { userId }, transaction: t });
            await user.destroy({ transaction: t });
        });

        return {
            message: 'Account deleted successfully',
        };
    }

    static async getUserGameHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { count, rows } = await models_1.GameParticipant.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: models_1.Game,
                    as: 'game',
                    include: [
                        {
                            model: models_1.Fixture,
                            as: 'fixture',
                            include: [
                                { model: models_1.Competition, as: 'competition' },
                                { model: models_1.Team, as: 'homeTeam' },
                                { model: models_1.Team, as: 'awayTeam' },
                            ],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        const items = rows.map((p) => {
            const g = p.get('game');
            const f = g?.get('fixture');
            const comp = f?.get('competition');
            const homeTeam = f?.get('homeTeam');
            const awayTeam = f?.get('awayTeam');
            return {
                gameId: g?.id,
                status: g?.status,
                totalPoints: p.totalPoints,
                joinedAt: p.createdAt || new Date(),
                fixture: f
                    ? {
                        id: f.id,
                        homeScore: f.homeScore,
                        awayScore: f.awayScore,
                        status: f.status,
                        competition: comp ? { code: comp.code, name: comp.name } : null,
                        homeTeam: homeTeam ? { name: homeTeam.name, logoUrl: homeTeam.logoUrl } : null,
                        awayTeam: awayTeam ? { name: awayTeam.name, logoUrl: awayTeam.logoUrl } : null,
                    }
                    : null,
            };
        });
        return {
            items,
            pagination: {
                page,
                limit,
                total: count,
                hasNext: page * limit < count,
            },
        };
    }
}
exports.UserService = UserService;
