import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Subscription {
  subscription_id?: number;
  user_id: number;
  service_id: number;
  start_date: Date | string;
  end_date: Date | string;
  auto_renew?: boolean;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  payment_method?: string;
  amount_paid?: number;
  created_at?: Date;
  updated_at?: Date;
  cancelled_at?: Date | null;
}

export interface SubscriptionDetail extends Subscription {
  username?: string;
  email?: string;
  service_name?: string;
  price?: number;
  billing_cycle?: string;
}

export class SubscriptionModel {
  // 创建订阅
  static async create(subscription: Subscription): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO subscriptions (user_id, service_id, start_date, end_date, auto_renew, status, payment_method, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        subscription.user_id,
        subscription.service_id,
        subscription.start_date,
        subscription.end_date,
        subscription.auto_renew || false,
        subscription.status || 'pending',
        subscription.payment_method,
        subscription.amount_paid
      ]
    );
    return result.insertId;
  }

  // 根据ID查询订阅
  static async findById(id: number): Promise<SubscriptionDetail | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.username, u.email, sv.service_name, sv.price, sv.billing_cycle
       FROM subscriptions s
       JOIN users u ON s.user_id = u.user_id
       JOIN services sv ON s.service_id = sv.service_id
       WHERE s.subscription_id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as SubscriptionDetail) : null;
  }

  // 根据用户ID查询订阅
  static async findByUserId(userId: number): Promise<SubscriptionDetail[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.username, u.email, sv.service_name, sv.price, sv.billing_cycle
       FROM subscriptions s
       JOIN users u ON s.user_id = u.user_id
       JOIN services sv ON s.service_id = sv.service_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows as SubscriptionDetail[];
  }

  // 查询所有订阅
  static async findAll(limit: number = 50, offset: number = 0): Promise<SubscriptionDetail[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.username, u.email, sv.service_name, sv.price, sv.billing_cycle
       FROM subscriptions s
       JOIN users u ON s.user_id = u.user_id
       JOIN services sv ON s.service_id = sv.service_id
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as SubscriptionDetail[];
  }

  // 更新订阅
  static async update(id: number, subscription: Partial<Subscription>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (subscription.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(subscription.start_date);
    }
    if (subscription.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(subscription.end_date);
    }
    if (subscription.auto_renew !== undefined) {
      fields.push('auto_renew = ?');
      values.push(subscription.auto_renew);
    }
    if (subscription.status !== undefined) {
      fields.push('status = ?');
      values.push(subscription.status);
    }
    if (subscription.payment_method !== undefined) {
      fields.push('payment_method = ?');
      values.push(subscription.payment_method);
    }
    if (subscription.amount_paid !== undefined) {
      fields.push('amount_paid = ?');
      values.push(subscription.amount_paid);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE subscriptions SET ${fields.join(', ')} WHERE subscription_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 取消订阅
  static async cancel(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE subscriptions SET status = ?, cancelled_at = NOW() WHERE subscription_id = ?',
      ['cancelled', id]
    );
    return result.affectedRows > 0;
  }

  // 删除订阅
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM subscriptions WHERE subscription_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 查询即将到期的订阅（用于提醒）
  static async findExpiringSoon(days: number = 7): Promise<SubscriptionDetail[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.username, u.email, sv.service_name, sv.price, sv.billing_cycle
       FROM subscriptions s
       JOIN users u ON s.user_id = u.user_id
       JOIN services sv ON s.service_id = sv.service_id
       WHERE s.status = 'active' 
       AND s.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY s.end_date ASC`,
      [days]
    );
    return rows as SubscriptionDetail[];
  }

  // 查询需要自动续费的订阅
  static async findAutoRenewable(): Promise<SubscriptionDetail[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.username, u.email, sv.service_name, sv.price, sv.billing_cycle
       FROM subscriptions s
       JOIN users u ON s.user_id = u.user_id
       JOIN services sv ON s.service_id = sv.service_id
       WHERE s.status = 'active' 
       AND s.auto_renew = TRUE
       AND s.end_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       ORDER BY s.end_date ASC`
    );
    return rows as SubscriptionDetail[];
  }

  // 更新过期订阅状态
  static async updateExpiredSubscriptions(): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE subscriptions SET status = ? WHERE status = ? AND end_date < CURDATE()',
      ['expired', 'active']
    );
    return result.affectedRows;
  }

  // 搜索订阅
  static async search(keyword: string): Promise<SubscriptionDetail[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.username, u.email, sv.service_name, sv.price, sv.billing_cycle
       FROM subscriptions s
       JOIN users u ON s.user_id = u.user_id
       JOIN services sv ON s.service_id = sv.service_id
       WHERE u.username LIKE ? OR u.email LIKE ? OR sv.service_name LIKE ?
       ORDER BY s.created_at DESC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows as SubscriptionDetail[];
  }
}
