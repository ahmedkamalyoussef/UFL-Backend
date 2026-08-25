import { sequelize } from '../config/database';
import { Game, GameParticipant, Wallet, WalletTransaction, Fixture, Competition, Team, User } from '../models';
import { isSupportedCompetition } from '../domain/competitions';

export class GameService {
  public static async createGame(fixtureId: string, entryFee: number = 500): Promise<Game> {
    const fixture = await Fixture.findByPk(fixtureId, {
      include: [{ model: Competition, as: 'competition' }],
    });

    if (!fixture) {
      throw { code: 'FIXTURE_NOT_FOUND', message: 'Fixture not found', statusCode: 404 };
    }

    const competition = fixture.get('competition') as Competition | null;
    if (!competition || !isSupportedCompetition(competition.code)) {
      throw { code: 'UNSUPPORTED_COMPETITION', message: 'Game creation is restricted to supported competitions', statusCode: 400 };
    }

    const game = await Game.create({
      fixtureId,
      status: 'WAITING',
      entryFee,
      currentDraftTurn: 1,
    });

    return game;
  }

  public static async getGames(userId?: string, status?: string) {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const games = await Game.findAll({
      where: whereClause,
      include: [
        {
          model: Fixture,
          as: 'fixture',
          include: [
            { model: Competition, as: 'competition' },
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' },
          ],
        },
        {
          model: GameParticipant,
          as: 'participants',
          attributes: ['userId', 'draftPosition'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return games.map((game) => {
      const fixture = game.get('fixture') as Fixture | null;
      const competition = fixture?.get('competition') as Competition | null;
      const homeTeam = fixture?.get('homeTeam') as Team | null;
      const awayTeam = fixture?.get('awayTeam') as Team | null;
      const participants = (game.get('participants') as GameParticipant[]) || [];

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

  public static async getGameById(gameId: string, userId?: string) {
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: Fixture,
          as: 'fixture',
          include: [
            { model: Competition, as: 'competition' },
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' },
          ],
        },
        {
          model: GameParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatarUrl'] }],
        },
      ],
    });

    if (!game) {
      throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
    }

    const fixture = game.get('fixture') as Fixture | null;
    const competition = fixture?.get('competition') as Competition | null;
    const homeTeam = fixture?.get('homeTeam') as Team | null;
    const awayTeam = fixture?.get('awayTeam') as Team | null;
    const participants = (game.get('participants') as GameParticipant[]) || [];

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
        const user = p.get('user') as User | null;
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

  public static async joinGame(gameId: string, userId: string) {
    return await sequelize.transaction(async (t) => {
      // 1. Row Lock Game
      const game = await Game.findByPk(gameId, {
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
      const fixture = await Fixture.findByPk(game.fixtureId, { transaction: t });
      if (fixture && fixture.status === 'CANCELLED') {
        throw { code: 'GAME_CANCELLED', message: 'Related match fixture is cancelled', statusCode: 400 };
      }

      // 2. Lock & count current participants
      const existingParticipants = await GameParticipant.findAll({
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
      const wallet = await Wallet.findOne({
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
      const participant = await GameParticipant.create(
        {
          gameId,
          userId,
          draftPosition: nextDraftPosition,
          totalPoints: 0.0,
        },
        { transaction: t }
      );

      // 6. Create GAME_ENTRY WalletTransaction
      await WalletTransaction.create(
        {
          walletId: wallet.id,
          amount: -game.entryFee,
          type: 'GAME_ENTRY',
          referenceId: `game-entry-${gameId}-${userId}`,
          description: `Entry fee for Game Room ${gameId}`,
        },
        { transaction: t }
      );

      // 7. Status transition to DRAFTING if room full and fixture is SCHEDULED
      if (existingParticipants.length + 1 === 4 && (!fixture || fixture.status === 'SCHEDULED')) {
        game.status = 'DRAFTING';
        await game.save({ transaction: t });
      }

      return {
        gameId: game.id,
        participantId: participant.id,
        draftPosition: participant.draftPosition,
        remainingBalance: wallet.balance,
      };
    });
  }

  public static async cancelGame(gameId: string, reason: string = 'UNFILLED_ROOM_OR_MATCH_CANCELLED') {
    return await sequelize.transaction(async (t) => {
      const game = await Game.findByPk(gameId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!game) {
        throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
      }

      if (game.status === 'CANCELLED') {
        return { gameId: game.id, status: 'CANCELLED', refundedCount: 0, message: 'Game already cancelled' };
      }

      const participants = await GameParticipant.findAll({
        where: { gameId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      let refundedCount = 0;

      for (const participant of participants) {
        const wallet = await Wallet.findOne({
          where: { userId: participant.userId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (wallet) {
          const idempotencyRef = `game-refund-${gameId}-${participant.userId}`;
          const existingRefund = await WalletTransaction.findOne({
            where: { walletId: wallet.id, referenceId: idempotencyRef, type: 'GAME_REFUND' },
            transaction: t,
          });

          if (!existingRefund) {
            wallet.balance += game.entryFee;
            await wallet.save({ transaction: t });

            await WalletTransaction.create(
              {
                walletId: wallet.id,
                amount: game.entryFee,
                type: 'GAME_REFUND',
                referenceId: idempotencyRef,
                description: `Refund for cancelled Game Room (${reason})`,
              },
              { transaction: t }
            );

            refundedCount++;
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
