import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { WalletService } from '../services/wallet.service';
import { sendSuccess, sendError } from '../utils/response';

export class WalletController {
  public static async getWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const wallet = await WalletService.getWalletByUserId(userId);

      if (!wallet) {
        sendError(res, 'WALLET_NOT_FOUND', 'Wallet not found for user', 404);
        return;
      }

      sendSuccess(res, {
        balance: wallet.balance,
        careerCoins: wallet.careerCoins,
        isEligibleForRewardedAd: wallet.isEligibleForRewardedAd,
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transactions = await WalletService.getTransactionsByUserId(userId);
      sendSuccess(res, transactions, 200);
    } catch (error) {
      next(error);
    }
  }
}
