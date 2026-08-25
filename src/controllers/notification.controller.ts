import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  public static async getUserNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const isReadFilter = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;

      const result = await NotificationService.getUserNotifications(userId, page, limit, isReadFilter);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(id, userId);
      sendSuccess(res, notification, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await NotificationService.markAllAsRead(userId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
