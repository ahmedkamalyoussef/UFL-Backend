import { User, Wallet, GlobalRanking } from '../models';

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
            rankingPoints: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            rankPosition: null,
          },
    };
  }
}
