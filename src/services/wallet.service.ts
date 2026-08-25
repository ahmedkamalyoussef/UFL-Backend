import { Wallet, WalletTransaction } from '../models';

export class WalletService {
  public static async getWalletByUserId(userId: string): Promise<Wallet | null> {
    return await Wallet.findOne({ where: { userId } });
  }

  public static async getTransactionsByUserId(userId: string): Promise<WalletTransaction[]> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      throw { code: 'WALLET_NOT_FOUND', message: 'Wallet not found for user', statusCode: 404 };
    }

    return await WalletTransaction.findAll({
      where: { walletId: wallet.id },
      order: [['createdAt', 'DESC']],
    });
  }
}
