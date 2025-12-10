import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Notification {
  notification_id?: number;
  user_id: number;
  subscription_id?: number | null;
  notification_type: 'renewal_reminder' | 'expiry_warning' | 'payment_success' | 'payment_failed' | 'cancellation';
  title: string;
  message: string;
  is_read?: boolean;
  sent_at?: Date;
  read_at?: Date | null;
}

export class NotificationModel {
  // 创建通知
  static async create(notification: Notification): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO notifications (user_id, subscription_id, notification_type, title, message, is_read) VALUES (?, ?, ?, ?, ?, ?)',
      [
        notification.user_id,
        notification.subscription_id,
        notification.notification_type,
        notification.title,
        notification.message,
        notification.is_read || false
      ]
    );
    return result.insertId;
  }

  // 根据ID查询通知
  static async findById(id: number): Promise<Notification | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE notification_id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Notification) : null;
  }

  // 根据用户ID查询通知
  static async findByUserId(userId: number, limit: number = 50): Promise<Notification[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows as Notification[];
  }

  // 获取未读通知数量
  static async getUnreadCount(userId: number): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  }

  // 标记为已读
  static async markAsRead(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE notification_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 标记用户所有通知为已读
  static async markAllAsRead(userId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // 删除通知
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM notifications WHERE notification_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 查询所有通知
  static async findAll(limit: number = 100, offset: number = 0): Promise<Notification[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications ORDER BY sent_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Notification[];
  }
}
