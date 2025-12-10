import { Request, Response } from 'express';
import { ServiceModel } from '../models/Service';

export class ServiceController {
  // 获取所有服务
  static async getAllServices(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const services = await ServiceModel.findAll(status);
      res.json({ success: true, data: services });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取单个服务
  static async getService(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const service = await ServiceModel.findById(id);
      if (!service) {
        return res.status(404).json({ success: false, error: '服务不存在' });
      }
      res.json({ success: true, data: service });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 创建服务
  static async createService(req: Request, res: Response) {
    try {
      const { service_name, description, price, billing_cycle, features, status } = req.body;

      // 验证必填字段
      if (!service_name || !price || !billing_cycle) {
        return res.status(400).json({ 
          success: false, 
          error: '服务名称、价格和计费周期为必填项' 
        });
      }

      // 验证billing_cycle
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(billing_cycle)) {
        return res.status(400).json({ 
          success: false, 
          error: '计费周期必须是 daily, weekly, monthly 或 yearly' 
        });
      }

      const serviceId = await ServiceModel.create({
        service_name,
        description,
        price,
        billing_cycle,
        features,
        status
      });

      res.status(201).json({ success: true, data: { service_id: serviceId } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 更新服务
  static async updateService(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { service_name, description, price, billing_cycle, features, status } = req.body;

      const success = await ServiceModel.update(id, {
        service_name,
        description,
        price,
        billing_cycle,
        features,
        status
      });

      if (!success) {
        return res.status(404).json({ success: false, error: '服务不存在或没有更改' });
      }

      res.json({ success: true, message: '服务更新成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 删除服务
  static async deleteService(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const success = await ServiceModel.delete(id);
      if (!success) {
        return res.status(404).json({ success: false, error: '服务不存在' });
      }
      res.json({ success: true, message: '服务删除成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 搜索服务
  static async searchServices(req: Request, res: Response) {
    try {
      const keyword = req.query.q as string;
      if (!keyword) {
        return res.status(400).json({ success: false, error: '请提供搜索关键词' });
      }
      const services = await ServiceModel.search(keyword);
      res.json({ success: true, data: services });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
