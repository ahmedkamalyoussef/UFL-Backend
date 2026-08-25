import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { SettlementService } from '../services/settlement.service';
import { sendSuccess } from '../utils/response';

export class SettlementController {
  public static async settleGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SettlementService.settleGame(id);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getGameResult(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const result = await SettlementService.getGameResult(id, userId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
