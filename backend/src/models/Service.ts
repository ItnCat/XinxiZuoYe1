import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Service {
  service_id?: number;
  service_name: string;
  description?: string;
  price: number;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  features?: any;
  created_at?: Date;
  updated_at?: Date;
  status?: 'active' | 'inactive';
}

export class ServiceModel {
  // 创建服务
  static async create(service: Service): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO services (service_name, description, price, billing_cycle, features, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        service.service_name,
        service.description,
        service.price,
        service.billing_cycle,
        service.features ? JSON.stringify(service.features) : null,
        service.status || 'active'
      ]
    );
    return result.insertId;
  }

  // 根据ID查询服务
  static async findById(id: number): Promise<Service | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services WHERE service_id = ?',
      [id]
    );
    if (rows.length > 0) {
      const service = rows[0] as Service;
      if (service.features && typeof service.features === 'string') {
        service.features = JSON.parse(service.features);
      }
      return service;
    }
    return null;
  }

  // 查询所有服务
  static async findAll(status?: string): Promise<Service[]> {
    let query = 'SELECT * FROM services';
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return (rows as Service[]).map(service => {
      if (service.features && typeof service.features === 'string') {
        service.features = JSON.parse(service.features);
      }
      return service;
    });
  }

  // 更新服务
  static async update(id: number, service: Partial<Service>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (service.service_name !== undefined) {
      fields.push('service_name = ?');
      values.push(service.service_name);
    }
    if (service.description !== undefined) {
      fields.push('description = ?');
      values.push(service.description);
    }
    if (service.price !== undefined) {
      fields.push('price = ?');
      values.push(service.price);
    }
    if (service.billing_cycle !== undefined) {
      fields.push('billing_cycle = ?');
      values.push(service.billing_cycle);
    }
    if (service.features !== undefined) {
      fields.push('features = ?');
      values.push(JSON.stringify(service.features));
    }
    if (service.status !== undefined) {
      fields.push('status = ?');
      values.push(service.status);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE services SET ${fields.join(', ')} WHERE service_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 删除服务
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM services WHERE service_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 搜索服务
  static async search(keyword: string): Promise<Service[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services WHERE service_name LIKE ? OR description LIKE ?',
      [`%${keyword}%`, `%${keyword}%`]
    );
    return (rows as Service[]).map(service => {
      if (service.features && typeof service.features === 'string') {
        service.features = JSON.parse(service.features);
      }
      return service;
    });
  }
}
