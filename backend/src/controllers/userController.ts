import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';

export class UserController {
  // 获取所有用户
  static async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await UserModel.findAll(limit, offset);
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取单个用户
  static async getUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      // 移除密码字段
      const { password_hash, ...userWithoutPassword } = user;
      res.json({ success: true, data: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 创建用户
  static async createUser(req: Request, res: Response) {
    try {
      const { username, email, phone, password, real_name, status } = req.body;

      // 验证必填字段
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: '用户名、邮箱和密码为必填项' });
      }

      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ success: false, error: '用户名已存在' });
      }

      // 检查邮箱是否已存在
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ success: false, error: '邮箱已存在' });
      }

      // 加密密码
      const password_hash = await bcrypt.hash(password, 10);

      const userId = await UserModel.create({
        username,
        email,
        phone,
        password_hash,
        real_name,
        status
      });

      res.status(201).json({ success: true, data: { user_id: userId } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 更新用户
  static async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { username, email, phone, real_name, status, password } = req.body;

      const updateData: any = { username, email, phone, real_name, status };

      // 如果提供了新密码，加密它
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      const success = await UserModel.update(id, updateData);
      if (!success) {
        return res.status(404).json({ success: false, error: '用户不存在或没有更改' });
      }

      res.json({ success: true, message: '用户更新成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 删除用户
  static async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const success = await UserModel.delete(id);
      if (!success) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      res.json({ success: true, message: '用户删除成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 搜索用户
  static async searchUsers(req: Request, res: Response) {
    try {
      const keyword = req.query.q as string;
      if (!keyword) {
        return res.status(400).json({ success: false, error: '请提供搜索关键词' });
      }
      const users = await UserModel.search(keyword);
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
