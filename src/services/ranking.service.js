"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const season_service_1 = require("./season.service");
const socket_server_1 = require("../infrastructure/socket/socket.server");
class RankingService {
    /**
     * Applies RP change (+3, +1, 0, -1) to user's GlobalRanking record for active season
     */
    static async applyRPChange(gameId, userId, rpChange, isWinner = false, customTransaction) {
        const executeLogic = async (t) => {
            const activeSeason = await season_service_1.SeasonService.getActiveSeason(t);
            const [globalRanking] = await models_1.GlobalRanking.findOrCreate({
                where: { userId, seasonId: activeSeason.id },
                defaults: {
                    seasonId: activeSeason.id,
                    userId,
                    rankingPoints: 1000 + rpChange, // Base starting RP 1000
                    gamesPlayed: 1,
                    gamesWon: isWinner ? 1 : 0,
                },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (globalRanking) {
                globalRanking.rankingPoints += rpChange; // Negative RP supported, no clamping
                globalRanking.gamesPlayed += 1;
                if (isWinner) {
                    globalRanking.gamesWon += 1;
                }
                await globalRanking.save({ transaction: t });
            }
            // Broadcast Socket.IO real-time ranking update
            socket_server_1.socketServer.broadcastToRoom(gameId, 'ranking:updated', {
                seasonId: activeSeason.id,
                gameId,
                updatedUsers: [{ userId, rpChange, newTotalRP: globalRanking.rankingPoints }],
            });
            return globalRanking;
        };
        if (customTransaction) {
            return await executeLogic(customTransaction);
        }
        else {
            return await database_1.sequelize.transaction(async (t) => await executeLogic(t));
        }
    }
    /**
     * Retrieves deterministic leaderboard for active or specified historical season
     * Tie-breaker order: (1) rankingPoints DESC -> (2) userId ASC
     */
    static async getLeaderboard(seasonId, limit = 50) {
        let targetSeasonId = seasonId;
        if (!targetSeasonId) {
            const activeSeason = await season_service_1.SeasonService.getActiveSeason();
            targetSeasonId = activeSeason.id;
        }
        const rankings = await models_1.GlobalRanking.findAll({
            where: { seasonId: targetSeasonId },
            include: [{ model: models_1.User, as: 'user', attributes: ['id', 'username', 'avatarUrl'] }],
            order: [
                ['rankingPoints', 'DESC'],
                ['userId', 'ASC'],
            ],
            limit,
        });
        const season = await models_1.Season.findByPk(targetSeasonId);
        return {
            season: season
                ? { id: season.id, name: season.name, status: season.status, startDate: season.startDate, endDate: season.endDate }
                : null,
            leaderboard: rankings.map((r, index) => {
                const user = r.get('user');
                return {
                    rank: index + 1,
                    userId: r.userId,
                    username: user?.username || 'Player',
                    avatarUrl: user?.avatarUrl || null,
                    rankingPoints: r.rankingPoints,
                    gamesPlayed: r.gamesPlayed,
                    gamesWon: r.gamesWon,
                };
            }),
        };
    }
    /**
     * Retrieves specific user's current rank & RP for active or specified season
     */
    static async getUserRank(userId, seasonId) {
        let targetSeasonId = seasonId;
        if (!targetSeasonId) {
            const activeSeason = await season_service_1.SeasonService.getActiveSeason();
            targetSeasonId = activeSeason.id;
        }
        const leaderboardData = await this.getLeaderboard(targetSeasonId, 10000);
        const userRankItem = leaderboardData.leaderboard.find((item) => item.userId === userId);
        if (userRankItem) {
            return {
                season: leaderboardData.season,
                userRank: userRankItem,
                totalParticipants: leaderboardData.leaderboard.length,
            };
        }
        const season = await models_1.Season.findByPk(targetSeasonId);
        return {
            season: season
                ? { id: season.id, name: season.name, status: season.status, startDate: season.startDate, endDate: season.endDate }
                : null,
            userRank: {
                rank: null,
                userId,
                rankingPoints: 1000,
                gamesPlayed: 0,
                gamesWon: 0,
            },
            totalParticipants: leaderboardData.leaderboard.length,
        };
    }
}
exports.RankingService = RankingService;
