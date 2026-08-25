import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { DraftService } from '../services/draft.service';
import { sendSuccess } from '../utils/response';

export class DraftController {
  public static async startDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await DraftService.startDraft(id);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getDraftState(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const state = await DraftService.getDraftState(id, userId);
      sendSuccess(res, state, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async selectPlayer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { playerId, turnNumber } = req.body;

      if (!playerId || turnNumber === undefined) {
        throw { code: 'VALIDATION_ERROR', message: 'playerId and turnNumber are required', statusCode: 400 };
      }

      const result = await DraftService.selectPlayer(id, userId, playerId, parseInt(turnNumber, 10));
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
