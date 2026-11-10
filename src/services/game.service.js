"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const notification_service_1 = require("./notification.service");
const draft_service_1 = require("./draft.service");
const socket_server_1 = require("../infrastructure/socket/socket.server");
const competitions_1 = require("../domain/competitions");
class GameService {
    static async createGame(fixtureId, entryFee = 500) {
        const fixture = await models_1.Fixture.findByPk(fixtureId, {
            include: [{ model: models_1.Competition, as: 'competition' }],
        });
        if (!fixture) {
            throw { code: 'FIXTURE_NOT_FOUND', message: 'Fixture not found', statusCode: 404 };
        }
        const competition = fixture.get('competition');
        if (!competition || !(0, competitions_1.isSupportedCompetition)(competition.code)) {
            throw { code: 'UNSUPPORTED_COMPETITION', message: 'Game creation is restricted to supported competitions', statusCode: 400 };
        }
        const game = await models_1.Game.create({
            fixtureId,
            status: 'WAITING',
            entryFee,
            currentDraftTurn: 1,
        });
        return game;
    }
    static async getGames(userId, status) {
        const whereClause = {};
        if (status) {
            whereClause.status = status.toUpperCase();
        }
        const games = await models_1.Game.findAll({
            where: whereClause,
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
                    attributes: ['userId', 'draftPosition'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return games.map((game) => {
            const fixture = game.get('fixture');
            const competition = fixture?.get('competition');
            const homeTeam = fixture?.get('homeTeam');
            const awayTeam = fixture?.get('awayTeam');
            const participants = game.get('participants') || [];
            return {
                id: game.id,
                fixtureId: game.fixtureId,
                status: game.status,
                entryFee: game.entryFee,
                currentParticipantCount: participants.length,
                maxParticipants: 4,
                hasJoined: userId ? participants.some((p) => p.userId === userId) : false,
                competition: competition
                    ? { id: competition.id, code: competition.code, name: competition.name, logoUrl: competition.logoUrl }
                    : null,
                homeTeam: homeTeam
                    ? { id: homeTeam.id, code: homeTeam.code, name: homeTeam.name, logoUrl: homeTeam.logoUrl }
                    : null,
                awayTeam: awayTeam
                    ? { id: awayTeam.id, code: awayTeam.code, name: awayTeam.name, logoUrl: awayTeam.logoUrl }
                    : null,
                startTime: fixture ? fixture.startTime : null,
                fixtureStatus: fixture ? fixture.status : null,
            };
        });
    }
    static async getGameById(gameId, userId) {
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
            ],
        });
        if (!game) {
            throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
        }
        const fixture = game.get('fixture');
        const competition = fixture?.get('competition');
        const homeTeam = fixture?.get('homeTeam');
        const awayTeam = fixture?.get('awayTeam');
        const participants = game.get('participants') || [];
        return {
            id: game.id,
            fixtureId: game.fixtureId,
            status: game.status,
            entryFee: game.entryFee,
            currentParticipantCount: participants.length,
            maxParticipants: 4,
            hasJoined: userId ? participants.some((p) => p.userId === userId) : false,
            competition: competition
                ? { id: competition.id, code: competition.code, name: competition.name, logoUrl: competition.logoUrl }
                : null,
            homeTeam: homeTeam
                ? { id: homeTeam.id, code: homeTeam.code, name: homeTeam.name, logoUrl: homeTeam.logoUrl }
                : null,
            awayTeam: awayTeam
                ? { id: awayTeam.id, code: awayTeam.code, name: awayTeam.name, logoUrl: awayTeam.logoUrl }
                : null,
            startTime: fixture ? fixture.startTime : null,
            fixtureStatus: fixture ? fixture.status : null,
            participants: participants.map((p) => {
                const user = p.get('user');
                return {
                    id: p.id,
                    userId: p.userId,
                    username: user?.username || 'Player',
                    avatarUrl: user?.avatarUrl || null,
                    draftPosition: p.draftPosition,
                    totalPoints: p.totalPoints,
                };
            }),
        };
    }
    static async joinGame(gameId, userId) {
        return await database_1.sequelize.transaction(async (t) => {
            // 1. Row Lock Game
            const game = await models_1.Game.findByPk(gameId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!game) {
                throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
            }
            if (game.status === 'FINISHED') {
                throw { code: 'GAME_FINISHED', message: 'Game has already finished', statusCode: 400 };
            }
            if (game.status === 'CANCELLED') {
                throw { code: 'GAME_CANCELLED', message: 'Game has been cancelled', statusCode: 400 };
            }
            // Check fixture status
            const fixture = await models_1.Fixture.findByPk(game.fixtureId, { transaction: t });
            if (fixture && fixture.status === 'CANCELLED') {
                throw { code: 'GAME_CANCELLED', message: 'Related match fixture is cancelled', statusCode: 400 };
            }
            // 2. Lock & count current participants
            const existingParticipants = await models_1.GameParticipant.findAll({
                where: { gameId },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (existingParticipants.length >= 4) {
                throw { code: 'GAME_FULL', message: 'Game room capacity reached (max 4 players)', statusCode: 400 };
            }
            if (existingParticipants.some((p) => p.userId === userId)) {
                throw { code: 'ALREADY_JOINED', message: 'You have already joined this game room', statusCode: 400 };
            }
            // 3. Lock User Wallet
            const wallet = await models_1.Wallet.findOne({
                where: { userId },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!wallet || wallet.balance < game.entryFee) {
                throw { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient wallet balance (500 Coins required)', statusCode: 400 };
            }
            // 4. Deduct 500 Coins
            wallet.balance -= game.entryFee;
            await wallet.save({ transaction: t });
            // 5. Create GameParticipant
            const nextDraftPosition = existingParticipants.length + 1;
            const participant = await models_1.GameParticipant.create({
                gameId,
                userId,
                draftPosition: nextDraftPosition,
                totalPoints: 0.0,
            }, { transaction: t });
            // 6. Create GAME_ENTRY WalletTransaction
            await models_1.WalletTransaction.create({
                walletId: wallet.id,
                amount: -game.entryFee,
                type: 'GAME_ENTRY',
                referenceId: `game-entry-${gameId}-${userId}`,
                description: `Entry fee for Game Room ${gameId}`,
            }, { transaction: t });

            const currentCount = existingParticipants.length + 1;
            const joiningUser = await models_1.User.findByPk(userId, { transaction: t, attributes: ['id', 'username', 'avatarUrl'] });

            // Broadcast real-time participant-joined to all players in the room
            socket_server_1.socketServer.broadcastToRoom(gameId, 'game:participant-joined', {
                gameId,
                participantCount: currentCount,
                participant: {
                    id: participant.id,
                    userId,
                    username: joiningUser?.username || 'Player',
                    avatarUrl: joiningUser?.avatarUrl || null,
                    draftPosition: participant.draftPosition,
                },
            });

            // Start draft ONLY when all 4 human challengers have joined the room!
            if (currentCount === 4) {
                game.status = 'DRAFTING';
                await game.save({ transaction: t });

                socket_server_1.socketServer.broadcastToRoom(gameId, 'game:draft-started', {
                    gameId,
                    status: 'DRAFTING',
                });

                setTimeout(() => {
                    draft_service_1.DraftService.startDraft(gameId).catch((e) => console.error('Failed to start draft for 4 players:', e));
                }, 1000);
            }

            return {
                gameId: game.id,
                participantId: participant.id,
                draftPosition: participant.draftPosition,
                participantCount: currentCount,
                status: game.status,
                remainingBalance: wallet.balance,
            };
        });
    }
    static async cancelGame(gameId, reason = 'UNFILLED_ROOM_OR_MATCH_CANCELLED') {
        return await database_1.sequelize.transaction(async (t) => {
            const game = await models_1.Game.findByPk(gameId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!game) {
                throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
            }
            if (game.status === 'CANCELLED') {
                return { gameId: game.id, status: 'CANCELLED', refundedCount: 0, message: 'Game already cancelled' };
            }
            const participants = await models_1.GameParticipant.findAll({
                where: { gameId },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            let refundedCount = 0;
            for (const participant of participants) {
                const wallet = await models_1.Wallet.findOne({
                    where: { userId: participant.userId },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });
                if (wallet) {
                    const idempotencyRef = `game-refund-${gameId}-${participant.userId}`;
                    const existingRefund = await models_1.WalletTransaction.findOne({
                        where: { walletId: wallet.id, referenceId: idempotencyRef, type: 'GAME_REFUND' },
                        transaction: t,
                    });
                    if (!existingRefund) {
                        wallet.balance += game.entryFee;
                        await wallet.save({ transaction: t });
                        await models_1.WalletTransaction.create({
                            walletId: wallet.id,
                            amount: game.entryFee,
                            type: 'GAME_REFUND',
                            referenceId: idempotencyRef,
                            description: `Refund for cancelled Game Room (${reason})`,
                        }, { transaction: t });
                        refundedCount++;
                        // Create persistent GAME_CANCELLED & GAME_REFUNDED notifications
                        await notification_service_1.NotificationService.createNotification({
                            userId: participant.userId,
                            type: 'GAME_CANCELLED',
                            title: 'Game Cancelled',
                            message: `Your game room was cancelled. Your ${game.entryFee} Coins entry fee has been refunded.`,
                            relatedEntityType: 'GAME',
                            relatedEntityId: gameId,
                        }, t);
                    }
                }
            }
            game.status = 'CANCELLED';
            await game.save({ transaction: t });
            return {
                gameId: game.id,
                status: 'CANCELLED',
                refundedCount,
                message: `Game room cancelled and ${refundedCount} participants refunded 500 Coins cleanly`,
            };
        });
    }
}
exports.GameService = GameService;
