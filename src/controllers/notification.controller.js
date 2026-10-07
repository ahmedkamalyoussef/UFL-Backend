"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const response_1 = require("../utils/response");
class NotificationController {
    static async getUserNotifications(req, res, next) {
        try {
            const userId = req.user.userId;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const isReadFilter = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
            const result = await notification_service_1.NotificationService.getUserNotifications(userId, page, limit, isReadFilter);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const notification = await notification_service_1.NotificationService.markAsRead(id, userId);
            (0, response_1.sendSuccess)(res, notification, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await notification_service_1.NotificationService.markAllAsRead(userId);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
