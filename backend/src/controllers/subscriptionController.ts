import { Request, Response } from 'express';
import { SubscriptionModel } from '../models/Subscription';
import { ServiceModel } from '../models/Service';
import { NotificationModel } from '../models/Notification';

export class SubscriptionController {
  // 获取所有订阅
  static async getAllSubscriptions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const subscriptions = await SubscriptionModel.findAll(limit, offset);
      res.json({ success: true, data: subscriptions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取单个订阅
  static async getSubscription(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const subscription = await SubscriptionModel.findById(id);
      if (!subscription) {
        return res.status(404).json({ success: false, error: '订阅不存在' });
      }
      res.json({ success: true, data: subscription });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 根据用户ID获取订阅
  static async getUserSubscriptions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await SubscriptionModel.findByUserId(userId);
      res.json({ success: true, data: subscriptions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 创建订阅（订阅服务）
  static async createSubscription(req: Request, res: Response) {
    try {
      const { user_id, service_id, start_date, end_date, auto_renew, payment_method, amount_paid } = req.body;

      // 验证必填字段
      if (!user_id || !service_id || !start_date || !end_date) {
        return res.status(400).json({ 
          success: false, 
          error: '用户ID、服务ID、开始日期和结束日期为必填项' 
        });
      }

      // 验证服务是否存在
      const service = await ServiceModel.findById(service_id);
      if (!service) {
        return res.status(404).json({ success: false, error: '服务不存在' });
      }

      const subscriptionId = await SubscriptionModel.create({
        user_id,
        service_id,
        start_date,
        end_date,
        auto_renew: auto_renew || false,
        status: 'active',
        payment_method,
        amount_paid: amount_paid || service.price
      });

      // 创建订阅成功通知
      await NotificationModel.create({
        user_id,
        subscription_id: subscriptionId,
        notification_type: 'payment_success',
        title: '订阅成功',
        message: `您已成功订阅 ${service.service_name} 服务`
      });

      res.status(201).json({ success: true, data: { subscription_id: subscriptionId } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 更新订阅
  static async updateSubscription(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { start_date, end_date, auto_renew, status, payment_method, amount_paid } = req.body;

      const success = await SubscriptionModel.update(id, {
        start_date,
        end_date,
        auto_renew,
        status,
        payment_method,
        amount_paid
      });

      if (!success) {
        return res.status(404).json({ success: false, error: '订阅不存在或没有更改' });
      }

      res.json({ success: true, message: '订阅更新成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 取消订阅
  static async cancelSubscription(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // 获取订阅信息
      const subscription = await SubscriptionModel.findById(id);
      if (!subscription) {
        return res.status(404).json({ success: false, error: '订阅不存在' });
      }

      const success = await SubscriptionModel.cancel(id);
      if (!success) {
        return res.status(404).json({ success: false, error: '订阅不存在' });
      }

      // 创建取消订阅通知
      await NotificationModel.create({
        user_id: subscription.user_id,
        subscription_id: id,
        notification_type: 'cancellation',
        title: '订阅已取消',
        message: `您的 ${subscription.service_name} 订阅已成功取消`
      });

      res.json({ success: true, message: '订阅取消成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 删除订阅
  static async deleteSubscription(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const success = await SubscriptionModel.delete(id);
      if (!success) {
        return res.status(404).json({ success: false, error: '订阅不存在' });
      }
      res.json({ success: true, message: '订阅删除成功' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 搜索订阅
  static async searchSubscriptions(req: Request, res: Response) {
    try {
      const keyword = req.query.q as string;
      if (!keyword) {
        return res.status(400).json({ success: false, error: '请提供搜索关键词' });
      }
      const subscriptions = await SubscriptionModel.search(keyword);
      res.json({ success: true, data: subscriptions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 获取即将到期的订阅
  static async getExpiringSoon(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const subscriptions = await SubscriptionModel.findExpiringSoon(days);
      res.json({ success: true, data: subscriptions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 处理自动续费
  static async processAutoRenew(req: Request, res: Response) {
    try {
      const subscriptions = await SubscriptionModel.findAutoRenewable();
      const renewed: number[] = [];
      const failed: number[] = [];

      for (const subscription of subscriptions) {
        try {
          // 获取服务信息以确定新的结束日期
          const service = await ServiceModel.findById(subscription.service_id);
          if (!service) continue;

          // 计算新的结束日期
          const currentEndDate = new Date(subscription.end_date);
          let newEndDate = new Date(currentEndDate);

          switch (service.billing_cycle) {
            case 'daily':
              newEndDate.setDate(newEndDate.getDate() + 1);
              break;
            case 'weekly':
              newEndDate.setDate(newEndDate.getDate() + 7);
              break;
            case 'monthly':
              newEndDate.setMonth(newEndDate.getMonth() + 1);
              break;
            case 'yearly':
              newEndDate.setFullYear(newEndDate.getFullYear() + 1);
              break;
          }

          // 更新订阅
          const success = await SubscriptionModel.update(subscription.subscription_id!, {
            end_date: newEndDate,
            status: 'active'
          });

          if (success) {
            renewed.push(subscription.subscription_id!);
            
            // 创建续费成功通知
            await NotificationModel.create({
              user_id: subscription.user_id,
              subscription_id: subscription.subscription_id,
              notification_type: 'payment_success',
              title: '自动续费成功',
              message: `您的 ${subscription.service_name} 订阅已自动续费，新的到期日期为 ${newEndDate.toISOString().split('T')[0]}`
            });
          } else {
            failed.push(subscription.subscription_id!);
          }
        } catch (error) {
          failed.push(subscription.subscription_id!);
        }
      }

      res.json({ 
        success: true, 
        data: { 
          renewed_count: renewed.length, 
          failed_count: failed.length,
          renewed,
          failed
        } 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 更新过期订阅状态
  static async updateExpiredStatus(req: Request, res: Response) {
    try {
      const count = await SubscriptionModel.updateExpiredSubscriptions();
      res.json({ success: true, data: { updated_count: count } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
