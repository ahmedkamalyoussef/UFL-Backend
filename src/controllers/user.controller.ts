import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class UserController {
  public static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.getUserProfile(userId);
      sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getGameHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const history = await UserService.getUserGameHistory(userId, page, limit);
      sendSuccess(res, history, 200);
    } catch (error) {
      next(error);
    }
  }
}
