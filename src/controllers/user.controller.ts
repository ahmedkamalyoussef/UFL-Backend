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
}
