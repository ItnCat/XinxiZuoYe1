import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  user_id?: number;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  real_name?: string;
  created_at?: Date;
  updated_at?: Date;
  status?: 'active' | 'inactive' | 'suspended';
}

export class UserModel {
  // 创建用户
  static async create(user: User): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, phone, password_hash, real_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, user.email, user.phone, user.password_hash, user.real_name, user.status || 'active']
    );
    return result.insertId;
  }

  // 根据ID查询用户
  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE user_id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  // 根据用户名查询
  static async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  // 根据邮箱查询
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  // 查询所有用户
  static async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id, username, email, phone, real_name, created_at, updated_at, status FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as User[];
  }

  // 更新用户
  static async update(id: number, user: Partial<User>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (user.username !== undefined) {
      fields.push('username = ?');
      values.push(user.username);
    }
    if (user.email !== undefined) {
      fields.push('email = ?');
      values.push(user.email);
    }
    if (user.phone !== undefined) {
      fields.push('phone = ?');
      values.push(user.phone);
    }
    if (user.real_name !== undefined) {
      fields.push('real_name = ?');
      values.push(user.real_name);
    }
    if (user.status !== undefined) {
      fields.push('status = ?');
      values.push(user.status);
    }
    if (user.password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(user.password_hash);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 删除用户
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE user_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 搜索用户
  static async search(keyword: string): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id, username, email, phone, real_name, created_at, updated_at, status FROM users WHERE username LIKE ? OR email LIKE ? OR real_name LIKE ?',
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows as User[];
  }
}
