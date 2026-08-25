import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { RankingService } from '../services/ranking.service';
import { SeasonService } from '../services/season.service';
import { sendSuccess } from '../utils/response';

export class RankingController {
  public static async getGlobalLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const result = await RankingService.getLeaderboard(undefined, limit);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getCurrentUserRank(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await RankingService.getUserRank(userId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getSeasons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seasons = await SeasonService.getAllSeasons();
      sendSuccess(res, seasons, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getSeasonLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const result = await RankingService.getLeaderboard(seasonId, limit);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async createSeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, startDate, endDate } = req.body;
      const season = await SeasonService.createSeason(name, new Date(startDate), new Date(endDate));
      sendSuccess(res, season, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async activateSeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId } = req.params;
      const season = await SeasonService.activateSeason(seasonId);
      sendSuccess(res, season, 200);
    } catch (error) {
      next(error);
    }
  }
}
