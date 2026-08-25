import { User, Wallet, GlobalRanking, GameParticipant, Game, Fixture, Competition, Team } from '../models';

export class UserService {
  public static async getUserProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'avatarUrl', 'createdAt'],
      include: [
        {
          model: Wallet,
          as: 'wallet',
          attributes: ['balance', 'careerCoins'],
        },
      ],
    });

    if (!user) {
      throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
    }

    const wallet = user.get('wallet') as Wallet | null;
    const ranking = await GlobalRanking.findOne({ where: { userId } });

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
            rankPosition: ranking.rankPosition,
          }
        : {
            rankingPoints: 1000,
            gamesPlayed: 0,
            gamesWon: 0,
            rankPosition: null,
          },
    };
  }

  public static async getUserGameHistory(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await GameParticipant.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Game,
          as: 'game',
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
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = rows.map((p) => {
      const g = p.get('game') as Game | null;
      const f = g?.get('fixture') as Fixture | null;
      const comp = f?.get('competition') as Competition | null;
      const homeTeam = f?.get('homeTeam') as Team | null;
      const awayTeam = f?.get('awayTeam') as Team | null;

      return {
        gameId: g?.id,
        status: g?.status,
        totalPoints: p.totalPoints,
        joinedAt: (p as any).createdAt || new Date(),
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
