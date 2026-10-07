"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const models_1 = require("../models");
class UserService {
    static async getUserProfile(userId) {
        const user = await models_1.User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'avatarUrl', 'createdAt'],
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
