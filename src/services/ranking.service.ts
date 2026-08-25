import { sequelize } from '../config/database';
import { GlobalRanking, User, Season } from '../models';
import { SeasonService } from './season.service';
import { socketServer } from '../infrastructure/socket/socket.server';

export class RankingService {
  /**
   * Applies RP change (+3, +1, 0, -1) to user's GlobalRanking record for active season
   */
  public static async applyRPChange(
    gameId: string,
    userId: string,
    rpChange: number,
    isWinner: boolean = false,
    customTransaction?: any
  ) {
    const executeLogic = async (t: any) => {
      const activeSeason = await SeasonService.getActiveSeason(t);

      const [globalRanking] = await GlobalRanking.findOrCreate({
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
      socketServer.broadcastToRoom(gameId, 'ranking:updated', {
        seasonId: activeSeason.id,
        gameId,
        updatedUsers: [{ userId, rpChange, newTotalRP: globalRanking.rankingPoints }],
      });

      return globalRanking;
    };

    if (customTransaction) {
      return await executeLogic(customTransaction);
    } else {
      return await sequelize.transaction(async (t) => await executeLogic(t));
    }
  }

  /**
   * Retrieves deterministic leaderboard for active or specified historical season
   * Tie-breaker order: (1) rankingPoints DESC -> (2) userId ASC
   */
  public static async getLeaderboard(seasonId?: string, limit: number = 50) {
    let targetSeasonId = seasonId;

    if (!targetSeasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
      targetSeasonId = activeSeason.id;
    }

    const rankings = await GlobalRanking.findAll({
      where: { seasonId: targetSeasonId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatarUrl'] }],
      order: [
        ['rankingPoints', 'DESC'],
        ['userId', 'ASC'],
      ],
      limit,
    });

    const season = await Season.findByPk(targetSeasonId);

    return {
      season: season
        ? { id: season.id, name: season.name, status: season.status, startDate: season.startDate, endDate: season.endDate }
        : null,
      leaderboard: rankings.map((r, index) => {
        const user = r.get('user') as User | null;
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
  public static async getUserRank(userId: string, seasonId?: string) {
    let targetSeasonId = seasonId;

    if (!targetSeasonId) {
      const activeSeason = await SeasonService.getActiveSeason();
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

    const season = await Season.findByPk(targetSeasonId);
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
