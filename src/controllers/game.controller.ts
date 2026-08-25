import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { GameService } from '../services/game.service';
import { sendSuccess } from '../utils/response';

export class GameController {
  public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fixtureId, entryFee } = req.body;
      if (!fixtureId) {
        throw { code: 'VALIDATION_ERROR', message: 'fixtureId is required', statusCode: 400 };
      }
      const game = await GameService.createGame(fixtureId, entryFee ? parseInt(entryFee, 10) : 500);
      sendSuccess(res, game, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getGames(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { status } = req.query;
      const games = await GameService.getGames(userId, status as string | undefined);
      sendSuccess(res, games, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getGameById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const game = await GameService.getGameById(id, userId);
      sendSuccess(res, game, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async joinGame(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await GameService.joinGame(id, userId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async cancelGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await GameService.cancelGame(id, reason);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
