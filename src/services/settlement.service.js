"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementService = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const socket_server_1 = require("../infrastructure/socket/socket.server");
const ranking_service_1 = require("./ranking.service");
const notification_service_1 = require("./notification.service");
class SettlementService {
    /**
     * Settles a UFL Game room atomically & idempotently
     */
    static async settleGame(gameId) {
        return await database_1.sequelize.transaction(async (t) => {
            // 1. Lock & Fetch Game
            const game = await models_1.Game.findByPk(gameId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!game) {
                throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
            }
            if (game.status === 'CANCELLED') {
                throw { code: 'GAME_CANCELLED', message: 'Cancelled games cannot be settled', statusCode: 400 };
            }
            // Idempotency check: Return existing results if already FINISHED
            if (game.status === 'FINISHED') {
                const existingResults = await this.getGameResult(gameId);
                return {
                    gameId: game.id,
                    status: 'FINISHED',
                    alreadySettled: true,
                    results: existingResults.results,
                };
            }
            // 2. Verify Fixture Status
            const fixture = await models_1.Fixture.findByPk(game.fixtureId, { transaction: t });
            if (!fixture) {
                throw { code: 'FIXTURE_NOT_FOUND', message: 'Related match fixture not found', statusCode: 404 };
            }
            if (fixture.status !== 'FINISHED') {
                throw { code: 'FIXTURE_NOT_FINISHED', message: 'Match fixture has not finished yet', statusCode: 400 };
            }
            // 3. Verify Participants & Selections
            const participants = await models_1.GameParticipant.findAll({
                where: { gameId },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (participants.length !== 4) {
                throw { code: 'INCOMPLETE_GAME', message: 'Game room must have exactly 4 participants to settle', statusCode: 400 };
            }
            const selections = await models_1.PlayerSelection.findAll({
                where: { gameId },
                transaction: t,
            });
            if (selections.length < 8) {
                throw { code: 'INCOMPLETE_GAME', message: 'Game draft must be completed with 8 selections before settling', statusCode: 400 };
            }
            // 4. Recalculate Fantasy Scores & Tie-Breaker Metrics
            const evaluatedParticipants = [];
            for (const p of participants) {
                const pSelections = selections.filter((s) => s.participantId === p.id);
                let totalPoints = 0;
                let totalGoals = 0;
                let totalAssists = 0;
                for (const sel of pSelections) {
                    const stat = await models_1.PlayerMatchStatistic.findOne({
                        where: { fixtureId: game.fixtureId, playerId: sel.playerId },
                        transaction: t,
                    });
                    if (stat) {
                        totalPoints += stat.totalFantasyPoints;
                        totalGoals += stat.goals;
                        totalAssists += stat.assists;
                    }
                }
                p.totalPoints = totalPoints;
                await p.save({ transaction: t });
                evaluatedParticipants.push({
                    participant: p,
                    userId: p.userId,
                    totalPoints,
                    totalGoals,
                    totalAssists,
                });
            }
            // 5. Deterministic 4-Tier Tie-Breaker Ranking
            // Order: (1) Total Points DESC -> (2) Total Goals DESC -> (3) Total Assists DESC -> (4) participantId ASC
            evaluatedParticipants.sort((a, b) => {
                if (b.totalPoints !== a.totalPoints)
                    return b.totalPoints - a.totalPoints;
                if (b.totalGoals !== a.totalGoals)
                    return b.totalGoals - a.totalGoals;
                if (b.totalAssists !== a.totalAssists)
                    return b.totalAssists - a.totalAssists;
                return a.participant.id.localeCompare(b.participant.id);
            });
            // 6. Distribute Coin & Global RP Rewards
            const settlementResults = [];
            for (let i = 0; i < evaluatedParticipants.length; i++) {
                const item = evaluatedParticipants[i];
                const rank = i + 1;
                let coinReward = 0;
                let rpChange = 0;
                if (rank === 1) {
                    coinReward = 1000;
                    rpChange = 3;
                }
                else if (rank === 2) {
                    coinReward = 500;
                    rpChange = 1;
                }
                else if (rank === 3) {
                    coinReward = 0;
                    rpChange = 0;
                }
                else if (rank === 4) {
                    coinReward = 0;
                    rpChange = -1;
                }
                // Credit Wallet for Coin Reward
                if (coinReward > 0) {
                    const wallet = await models_1.Wallet.findOne({
                        where: { userId: item.userId },
                        transaction: t,
                        lock: t.LOCK.UPDATE,
                    });
                    if (wallet) {
                        const idempotencyRef = `game-payout-rank${rank}-${gameId}-${item.userId}`;
                        const existingPayout = await models_1.WalletTransaction.findOne({
                            where: { walletId: wallet.id, referenceId: idempotencyRef, type: 'GAME_REWARD' },
                            transaction: t,
                        });
                        if (!existingPayout) {
                            wallet.balance += coinReward;
                            await wallet.save({ transaction: t });
                            await models_1.WalletTransaction.create({
                                walletId: wallet.id,
                                amount: coinReward,
                                type: 'GAME_REWARD',
                                referenceId: idempotencyRef,
                                description: `Game Room Reward (${rank}${rank === 1 ? 'st' : 'nd'} Place)`,
                            }, { transaction: t });
                        }
                    }
                }
                // Delegate Global RP update to RankingService
                await ranking_service_1.RankingService.applyRPChange(gameId, item.userId, rpChange, rank === 1, t);
                // Create Persistent Game Finished Notification via NotificationService
                await notification_service_1.NotificationService.createNotification({
                    userId: item.userId,
                    type: 'GAME_FINISHED',
                    title: 'Game Finished',
                    message: `You finished ${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} and earned ${coinReward} Coins (+${rpChange} RP).`,
                    relatedEntityType: 'GAME',
                    relatedEntityId: gameId,
                }, t);
                settlementResults.push({
                    rank,
                    participantId: item.participant.id,
                    userId: item.userId,
                    fantasyPoints: item.totalPoints,
                    coinReward,
                    rpChange,
                });
            }
            // 7. Update Game Status -> FINISHED
            game.status = 'FINISHED';
            await game.save({ transaction: t });
            // 8. Broadcast Socket.IO game:finished event
            socket_server_1.socketServer.broadcastToRoom(gameId, 'game:finished', {
                gameId: game.id,
                status: 'FINISHED',
                results: settlementResults,
            });
            return {
                gameId: game.id,
                status: 'FINISHED',
                settledAt: new Date(),
                results: settlementResults,
            };
        });
    }
    /**
     * Fetches finalized result payload for GET /api/v1/games/:id/result
     */
    static async getGameResult(gameId, userId) {
        const game = await models_1.Game.findByPk(gameId, {
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
                {
                    model: models_1.GameParticipant,
                    as: 'participants',
                    include: [{ model: models_1.User, as: 'user', attributes: ['id', 'username', 'avatarUrl'] }],
                },
                {
                    model: models_1.PlayerSelection,
                    as: 'playerSelections',
                    include: [{ model: models_1.Player, as: 'player' }],
                },
            ],
        });
        if (!game) {
            throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
        }
        const fixture = game.get('fixture');
        const participants = game.get('participants') || [];
        const selections = game.get('playerSelections') || [];
        const evaluatedParticipants = [];
        for (const p of participants) {
            const user = p.get('user');
            const pSelections = selections.filter((s) => s.participantId === p.id);
            let totalGoals = 0;
            let totalAssists = 0;
            for (const sel of pSelections) {
                const stat = await models_1.PlayerMatchStatistic.findOne({
                    where: { fixtureId: game.fixtureId, playerId: sel.playerId },
                });
                if (stat) {
                    totalGoals += stat.goals;
                    totalAssists += stat.assists;
                }
            }
            evaluatedParticipants.push({
                participantId: p.id,
                userId: p.userId,
                username: user?.username || 'Player',
                avatarUrl: user?.avatarUrl || null,
                draftPosition: p.draftPosition,
                totalPoints: p.totalPoints,
                totalGoals,
                totalAssists,
                draftedPlayers: pSelections.map((s) => {
                    const pl = s.get('player');
                    return {
                        id: s.playerId,
                        name: pl?.name || 'Player',
                        position: pl?.position,
                        isAutoPick: s.isAutoPick,
                    };
                }),
            });
        }
        // Sort deterministically
        evaluatedParticipants.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints)
                return b.totalPoints - a.totalPoints;
            if (b.totalGoals !== a.totalGoals)
                return b.totalGoals - a.totalGoals;
            if (b.totalAssists !== a.totalAssists)
                return b.totalAssists - a.totalAssists;
            return a.participantId.localeCompare(b.participantId);
        });
        const results = evaluatedParticipants.map((item, index) => {
            const rank = index + 1;
            return {
                rank,
                ...item,
                coinReward: rank === 1 ? 1000 : rank === 2 ? 500 : 0,
                rpChange: rank === 1 ? 3 : rank === 2 ? 1 : rank === 3 ? 0 : -1,
            };
        });
        return {
            gameId: game.id,
            status: game.status,
            fixture: fixture
                ? {
                    id: fixture.id,
                    homeScore: fixture.homeScore,
                    awayScore: fixture.awayScore,
                    status: fixture.status,
                }
                : null,
            currentUserResult: userId ? results.find((r) => r.userId === userId) || null : null,
            results,
        };
    }
}
exports.SettlementService = SettlementService;
