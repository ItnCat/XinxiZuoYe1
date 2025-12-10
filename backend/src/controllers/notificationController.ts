import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';

export class NotificationController {
  // 获取所有通知
  static async getAllNotifications(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const notifications = await NotificationModel.findAll(limit, offset);
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取单个通知
  static async getNotification(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const notification = await NotificationModel.findById(id);
      if (!notification) {
        return res.status(404).json({ success: false, error: '通知不存在' });
      }
      res.json({ success: true, data: notification });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 根据用户ID获取通知
  static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await NotificationModel.findByUserId(userId, limit);
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取未读通知数量
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const count = await NotificationModel.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 标记通知为已读
  static async markAsRead(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const success = await NotificationModel.markAsRead(id);
      if (!success) {
        return res.status(404).json({ success: false, error: '通知不存在' });
      }
      res.json({ success: true, message: '通知已标记为已读' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 标记所有通知为已读
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const success = await NotificationModel.markAllAsRead(userId);
      res.json({ success: true, message: '所有通知已标记为已读' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 删除通知
  static async deleteNotification(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const success = await NotificationModel.delete(id);
      if (!success) {
        return res.status(404).json({ success: false, error: '通知不存在' });
      }
      res.json({ success: true, message: '通知删除成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 创建通知
  static async createNotification(req: Request, res: Response) {
    try {
      const { user_id, subscription_id, notification_type, title, message } = req.body;

      // 验证必填字段
      if (!user_id || !notification_type || !title || !message) {
        return res.status(400).json({ 
          success: false, 
          error: '用户ID、通知类型、标题和消息为必填项' 
        });
      }

      const notificationId = await NotificationModel.create({
        user_id,
        subscription_id,
        notification_type,
        title,
        message
      });

      res.status(201).json({ success: true, data: { notification_id: notificationId } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
