import { sequelize } from '../config/database';
import {
  Game,
  GameParticipant,
  PlayerSelection,
  PlayerMatchStatistic,
  FixtureEvent,
  Player,
  User,
} from '../models';
import {
  FixtureEventDTO,
  PlayerMatchStatisticDTO,
} from '../domain/dtos/football.dto';
import { socketServer } from '../infrastructure/socket/socket.server';
import { Op } from 'sequelize';

export class ScoringService {
  /**
   * Pure deterministic calculation of total fantasy points from normalized statistics
   */
  public static calculatePlayerFantasyPoints(stats: PlayerMatchStatisticDTO): number {
    let points = 0;

    points += (stats.goals || 0) * 40;
    points += (stats.assists || 0) * 20;
    points += (stats.bigChancesCreated || 0) * 5; // MUST be 0 unless explicitly supplied
    points += (stats.successfulPasses || 0) * 1;
    points += (stats.failedPasses || 0) * -1;
    points += (stats.tackles || 0) * 3;
    points += (stats.yellowCards || 0) * -5;
    points += (stats.redCards || 0) * -20;
    points += (stats.saves || 0) * 10;

    // Clean sheet rule: Defender or Goalkeeper, played >= 60 minutes, conceded 0 on pitch
    const isDefOrGK = stats.position === 'DEFENDER' || stats.position === 'GOALKEEPER';
    if (isDefOrGK && stats.minutesPlayed >= 60 && stats.cleanSheet === true) {
      points += 20;
    }

    return points;
  }

  /**
   * Generates audit breakdown explaining how points were calculated for a player
   */
  public static calculatePointsBreakdown(stats: PlayerMatchStatisticDTO) {
    const isDefOrGK = stats.position === 'DEFENDER' || stats.position === 'GOALKEEPER';
    const isCleanSheetEligible = isDefOrGK && stats.minutesPlayed >= 60 && stats.cleanSheet === true;

    return [
      { rule: 'Goal', count: stats.goals || 0, points: (stats.goals || 0) * 40 },
      { rule: 'Assist', count: stats.assists || 0, points: (stats.assists || 0) * 20 },
      { rule: 'Big Chance Created', count: stats.bigChancesCreated || 0, points: (stats.bigChancesCreated || 0) * 5 },
      { rule: 'Successful Pass', count: stats.successfulPasses || 0, points: (stats.successfulPasses || 0) * 1 },
      { rule: 'Failed Pass', count: stats.failedPasses || 0, points: (stats.failedPasses || 0) * -1 },
      { rule: 'Tackle', count: stats.tackles || 0, points: (stats.tackles || 0) * 3 },
      { rule: 'Yellow Card', count: stats.yellowCards || 0, points: (stats.yellowCards || 0) * -5 },
      { rule: 'Red Card', count: stats.redCards || 0, points: (stats.redCards || 0) * -20 },
      { rule: 'Goalkeeper Save', count: stats.saves || 0, points: (stats.saves || 0) * 10 },
      { rule: 'Clean Sheet', count: isCleanSheetEligible ? 1 : 0, points: isCleanSheetEligible ? 20 : 0 },
    ];
  }

  /**
   * Process incoming real-time football event idempotently
   */
  public static async processFixtureEvent(fixtureId: string, event: FixtureEventDTO) {
    return await sequelize.transaction(async (t) => {
      // 1. Idempotency Check
      const eventKey = event.externalEventId ? `ext:${event.externalEventId}` : `evt:${event.minute}:${event.playerId}:${event.eventType}`;
      const existingEvent = await FixtureEvent.findOne({
        where: { fixtureId, detail: eventKey },
        transaction: t,
      });
      if (existingEvent) {
        return { status: 'SKIPPED_DUPLICATE', externalEventId: event.externalEventId };
      }

      // 2. Record FixtureEvent
      await FixtureEvent.create(
        {
          fixtureId,
          playerId: event.playerId,
          eventType: event.eventType,
          minute: event.minute,
          detail: eventKey,
        },
        { transaction: t }
      );

      // 3. Compute Delta Fantasy Points
      let delta = 0;
      switch (event.eventType) {
        case 'GOAL':
          delta = 40;
          break;
        case 'ASSIST':
          delta = 20;
          break;
        case 'PASS':
          delta = event.detail === 'SUCCESSFUL' ? 1 : -1;
          break;
        case 'TACKLE':
          delta = 3;
          break;
        case 'YELLOW_CARD':
          delta = -5;
          break;
        case 'RED_CARD':
          delta = -20;
          break;
        case 'SAVE':
          delta = 10;
          break;
        case 'CLEAN_SHEET':
          delta = 20;
          break;
        default:
          delta = 0;
      }

      // 4. Update Participant Scores for active games
      if (event.playerId && delta !== 0) {
        const activeGames = await Game.findAll({
          where: { fixtureId, status: { [Op.in]: ['WAITING', 'DRAFTING', 'LIVE'] } },
          transaction: t,
        });

        for (const game of activeGames) {
          const selections = await PlayerSelection.findAll({
            where: { gameId: game.id, playerId: event.playerId },
            transaction: t,
          });

          for (const sel of selections) {
            const participant = await GameParticipant.findByPk(sel.participantId, {
              transaction: t,
              lock: t.LOCK.UPDATE,
            });
            if (participant) {
              participant.totalPoints += delta;
              await participant.save({ transaction: t });
            }
          }

          // Broadcast Socket.IO live event to game room
          socketServer.broadcastToRoom(game.id, 'game:live-event', {
            gameId: game.id,
            eventType: event.eventType,
            playerId: event.playerId,
            fantasyPointsDelta: delta,
          });

          // Update and broadcast rankings
          await this.getGameRankings(game.id, t);
        }
      }

      return { status: 'PROCESSED', delta };
    });
  }

  /**
   * Process and update player match statistics deterministically (stat corrections / post-match sync)
   */
  public static async processPlayerMatchStatistics(fixtureId: string, statsList: PlayerMatchStatisticDTO[]) {
    return await sequelize.transaction(async (t) => {
      // 1. Upsert statistics & compute exact points for each player
      for (const stats of statsList) {
        const points = this.calculatePlayerFantasyPoints(stats);

        const existingStat = await PlayerMatchStatistic.findOne({
          where: { fixtureId, playerId: stats.playerId },
          transaction: t,
        });

        if (existingStat) {
          await existingStat.update(
            {
              minutesPlayed: stats.minutesPlayed,
              goals: stats.goals,
              assists: stats.assists,
              bigChancesCreated: stats.bigChancesCreated,
              successfulPasses: stats.successfulPasses,
              failedPasses: stats.failedPasses,
              tackles: stats.tackles,
              yellowCards: stats.yellowCards,
              redCards: stats.redCards,
              saves: stats.saves,
              cleanSheet: stats.cleanSheet,
              totalFantasyPoints: points,
            },
            { transaction: t }
          );
        } else {
          await PlayerMatchStatistic.create(
            {
              fixtureId,
              playerId: stats.playerId,
              minutesPlayed: stats.minutesPlayed,
              goals: stats.goals,
              assists: stats.assists,
              bigChancesCreated: stats.bigChancesCreated,
              successfulPasses: stats.successfulPasses,
              failedPasses: stats.failedPasses,
              tackles: stats.tackles,
              yellowCards: stats.yellowCards,
              redCards: stats.redCards,
              saves: stats.saves,
              cleanSheet: stats.cleanSheet,
              totalFantasyPoints: points,
            },
            { transaction: t }
          );
        }
      }

      // 2. Recalculate participant total points deterministically for all active games
      const activeGames = await Game.findAll({
        where: { fixtureId, status: { [Op.in]: ['WAITING', 'DRAFTING', 'LIVE', 'FINISHED'] } },
        transaction: t,
      });

      for (const game of activeGames) {
        const participants = await GameParticipant.findAll({
          where: { gameId: game.id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        for (const p of participants) {
          const selections = await PlayerSelection.findAll({
            where: { participantId: p.id },
            transaction: t,
          });

          let participantSum = 0;
          for (const sel of selections) {
            const stat = await PlayerMatchStatistic.findOne({
              where: { fixtureId, playerId: sel.playerId },
              transaction: t,
            });
            if (stat) {
              participantSum += stat.totalFantasyPoints;
            }
          }

          p.totalPoints = participantSum;
          await p.save({ transaction: t });
        }

        await this.getGameRankings(game.id, t);
      }

      return { status: 'STATS_UPDATED', count: statsList.length };
    });
  }

  /**
   * Compute deterministic live rankings for a game room
   * Tie-breaker order: (1) Total Points DESC -> (2) Total Goals DESC -> (3) Total Assists DESC -> (4) participantId ASC
   */
  public static async getGameRankings(gameId: string, customTransaction?: any) {
    const participants = await GameParticipant.findAll({
      where: { gameId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatarUrl'] },
        { model: PlayerSelection, as: 'selections' },
      ],
      transaction: customTransaction,
    });

    const game = await Game.findByPk(gameId, { transaction: customTransaction });
    const fixtureId = game?.fixtureId;

    // Calculate tie-breaker metrics (goals & assists) for each participant
    const evaluatedParticipants = [];
    for (const p of participants) {
      const user = p.get('user') as User | null;
      const selections = (p.get('selections') as PlayerSelection[]) || [];

      let totalGoals = 0;
      let totalAssists = 0;

      if (fixtureId) {
        for (const sel of selections) {
          const stat = await PlayerMatchStatistic.findOne({
            where: { fixtureId, playerId: sel.playerId },
            transaction: customTransaction,
          });
          if (stat) {
            totalGoals += stat.goals;
            totalAssists += stat.assists;
          }
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
      });
    }

    // Sort deterministically
    evaluatedParticipants.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
      if (b.totalAssists !== a.totalAssists) return b.totalAssists - a.totalAssists;
      return a.participantId.localeCompare(b.participantId);
    });

    const rankings = evaluatedParticipants.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    // Broadcast Socket.IO ranking event
    socketServer.broadcastToRoom(gameId, 'game:ranking', {
      gameId,
      rankings,
    });

    return rankings;
  }

  /**
   * Detailed breakdown for a selected player in a game room
   */
  public static async getPlayerPointsBreakdown(gameId: string, playerId: string) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
    }

    const player = await Player.findByPk(playerId);
    if (!player) {
      throw { code: 'PLAYER_NOT_FOUND', message: 'Player not found', statusCode: 404 };
    }

    const stat = await PlayerMatchStatistic.findOne({
      where: { fixtureId: game.fixtureId, playerId },
    });

    const mockStat: PlayerMatchStatisticDTO = stat
      ? {
          fixtureId: game.fixtureId,
          playerId: player.id,
          name: player.name,
          position: player.position,
          goals: stat.goals,
          assists: stat.assists,
          bigChancesCreated: stat.bigChancesCreated,
          successfulPasses: stat.successfulPasses,
          failedPasses: stat.failedPasses,
          tackles: stat.tackles,
          yellowCards: stat.yellowCards,
          redCards: stat.redCards,
          saves: stat.saves,
          cleanSheet: stat.cleanSheet,
          minutesPlayed: stat.minutesPlayed,
          totalFantasyPoints: stat.totalFantasyPoints,
        }
      : {
          fixtureId: game.fixtureId,
          playerId: player.id,
          name: player.name,
          position: player.position,
          goals: 0,
          assists: 0,
          bigChancesCreated: 0,
          successfulPasses: 0,
          failedPasses: 0,
          tackles: 0,
          yellowCards: 0,
          redCards: 0,
          saves: 0,
          cleanSheet: false,
          minutesPlayed: 0,
          totalFantasyPoints: 0,
        };

    const totalPoints = this.calculatePlayerFantasyPoints(mockStat);
    const breakdown = this.calculatePointsBreakdown(mockStat);

    return {
      gameId,
      playerId,
      playerName: player.name,
      position: player.position,
      totalFantasyPoints: totalPoints,
      statistics: mockStat,
      breakdown,
    };
  }
}
