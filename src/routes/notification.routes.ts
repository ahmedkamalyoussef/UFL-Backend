import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/notifications', NotificationController.getUserNotifications);
router.patch('/notifications/read-all', NotificationController.markAllAsRead);
router.patch('/notifications/:id/read', NotificationController.markAsRead);

export default router;
