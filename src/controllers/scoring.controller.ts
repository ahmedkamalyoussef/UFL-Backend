import { Request, Response, NextFunction } from 'express';
import { ScoringService } from '../services/scoring.service';
import { sendSuccess } from '../utils/response';

export class ScoringController {
  public static async getGameRankings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const rankings = await ScoringService.getGameRankings(id);
      sendSuccess(res, rankings, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getPlayerPointsBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, playerId } = req.params;
      const breakdown = await ScoringService.getPlayerPointsBreakdown(id, playerId);
      sendSuccess(res, breakdown, 200);
    } catch (error) {
      next(error);
    }
  }
}
