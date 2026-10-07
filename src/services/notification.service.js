"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const socket_server_1 = require("../infrastructure/socket/socket.server");
class NotificationService {
    /**
     * Creates a notification idempotently and emits notification:new after transaction commit
     */
    static async createNotification(params, customTransaction) {
        const { userId, type, title, message, relatedEntityType, relatedEntityId } = params;
        const executeCreate = async (t) => {
            // 1. Idempotency Guard for persistent system notifications
            if (relatedEntityId && ['GAME_FINISHED', 'GAME_CANCELLED', 'GAME_REFUNDED', 'SEASON_STARTED'].includes(type)) {
                const existing = await models_1.Notification.findOne({
                    where: { userId, type, relatedEntityId },
                    transaction: t,
                });
                if (existing) {
                    return existing; // Return existing notification without creating duplicate
                }
            }
            // 2. Create Notification
            const notification = await models_1.Notification.create({
                userId,
                type,
                title,
                message,
                isRead: false,
                readAt: null,
                relatedEntityType: relatedEntityType || null,
                relatedEntityId: relatedEntityId || null,
            }, { transaction: t });
            // 3. Transaction Safety: Emit Socket.IO event ONLY AFTER transaction commits
            if (t) {
                t.afterCommit(() => {
                    socket_server_1.socketServer.sendToUser(userId, 'notification:new', {
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
            }
            else {
                socket_server_1.socketServer.sendToUser(userId, 'notification:new', {
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
        }
        else {
            return await database_1.sequelize.transaction(async (t) => await executeCreate(t));
        }
    }
    /**
     * Retrieves paginated notifications for an authenticated user with unreadCount
     */
    static async getUserNotifications(userId, page = 1, limit = 20, isReadFilter) {
        const where = { userId };
        if (isReadFilter !== undefined) {
            where.isRead = isReadFilter;
        }
        const offset = (page - 1) * limit;
        const { count, rows } = await models_1.Notification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        const unreadCount = await models_1.Notification.count({
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
    static async markAsRead(notificationId, userId) {
        const notification = await models_1.Notification.findByPk(notificationId);
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
    static async markAllAsRead(userId) {
        const [updatedCount] = await models_1.Notification.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } });
        return { updatedCount };
    }
}
exports.NotificationService = NotificationService;
