import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

router.get('/', NotificationController.getAllNotifications);
router.get('/user/:userId', NotificationController.getUserNotifications);
router.get('/user/:userId/unread-count', NotificationController.getUnreadCount);
router.get('/:id', NotificationController.getNotification);
router.post('/', NotificationController.createNotification);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/user/:userId/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
