import { sequelize } from '../config/database';
import { Notification, NotificationType } from '../models';
import { socketServer } from '../infrastructure/socket/socket.server';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export class NotificationService {
  /**
   * Creates a notification idempotently and emits notification:new after transaction commit
   */
  public static async createNotification(
    params: CreateNotificationParams,
    customTransaction?: any
  ): Promise<Notification> {
    const { userId, type, title, message, relatedEntityType, relatedEntityId } = params;

    const executeCreate = async (t: any) => {
      // 1. Idempotency Guard for persistent system notifications
      if (relatedEntityId && ['GAME_FINISHED', 'GAME_CANCELLED', 'GAME_REFUNDED', 'SEASON_STARTED'].includes(type)) {
        const existing = await Notification.findOne({
          where: { userId, type, relatedEntityId },
          transaction: t,
        });
        if (existing) {
          return existing; // Return existing notification without creating duplicate
        }
      }

      // 2. Create Notification
      const notification = await Notification.create(
        {
          userId,
          type,
          title,
          message,
          isRead: false,
          readAt: null,
          relatedEntityType: relatedEntityType || null,
          relatedEntityId: relatedEntityId || null,
        },
        { transaction: t }
      );

      // 3. Transaction Safety: Emit Socket.IO event ONLY AFTER transaction commits
      if (t) {
        t.afterCommit(() => {
          socketServer.sendToUser(userId, 'notification:new', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            relatedEntityType: notification.relatedEntityType,
            relatedEntityId: notification.relatedEntityId,
            createdAt: notification.createdAt,
          });
        });
      } else {
        socketServer.sendToUser(userId, 'notification:new', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          relatedEntityType: notification.relatedEntityType,
          relatedEntityId: notification.relatedEntityId,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    };

    if (customTransaction) {
      return await executeCreate(customTransaction);
    } else {
      return await sequelize.transaction(async (t) => await executeCreate(t));
    }
  }

  /**
   * Retrieves paginated notifications for an authenticated user with unreadCount
   */
  public static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    isReadFilter?: boolean
  ) {
    const where: any = { userId };
    if (isReadFilter !== undefined) {
      where.isRead = isReadFilter;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    return {
      items: rows,
      pagination: {
        page,
        limit,
        total: count,
        hasNext: page * limit < count,
      },
      unreadCount,
    };
  }

  /**
   * Marks a specific notification as read, enforcing user authorization
   */
  public static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await Notification.findByPk(notificationId);

    if (!notification) {
      throw { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found', statusCode: 404 };
    }

    if (notification.userId !== userId) {
      throw { code: 'FORBIDDEN', message: 'You are not authorized to modify this notification', statusCode: 403 };
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  }

  /**
   * Marks all unread notifications belonging to the authenticated user as read
   */
  public static async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const [updatedCount] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );

    return { updatedCount };
  }
}
