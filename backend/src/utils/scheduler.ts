import { SubscriptionModel } from '../models/Subscription';
import { NotificationModel } from '../models/Notification';

/**
 * 定时任务工具类
 * 用于处理自动续费和到期提醒
 */
export class Scheduler {
  /**
   * 处理自动续费
   * 应该每天运行一次
   */
  static async processAutoRenewals(): Promise<void> {
    try {
      console.log('[Scheduler] Starting auto-renewal process...');
      
      const subscriptions = await SubscriptionModel.findAutoRenewable();
      console.log(`[Scheduler] Found ${subscriptions.length} subscriptions for auto-renewal`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const subscription of subscriptions) {
        try {
          const currentEndDate = new Date(subscription.end_date);
          let newEndDate = new Date(currentEndDate);
          
          // 根据计费周期计算新的结束日期
          switch (subscription.billing_cycle) {
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
            successCount++;
            
            // 创建续费成功通知
            await NotificationModel.create({
              user_id: subscription.user_id,
              subscription_id: subscription.subscription_id,
              notification_type: 'payment_success',
              title: '自动续费成功',
              message: `您的 ${subscription.service_name} 订阅已自动续费，新的到期日期为 ${newEndDate.toISOString().split('T')[0]}`
            });
            
            console.log(`[Scheduler] Successfully renewed subscription ${subscription.subscription_id}`);
          } else {
            failCount++;
            console.error(`[Scheduler] Failed to renew subscription ${subscription.subscription_id}`);
          }
        } catch (error) {
          failCount++;
          console.error(`[Scheduler] Error renewing subscription ${subscription.subscription_id}:`, error);
        }
      }
      
      console.log(`[Scheduler] Auto-renewal completed: ${successCount} succeeded, ${failCount} failed`);
    } catch (error) {
      console.error('[Scheduler] Error in auto-renewal process:', error);
    }
  }
  
  /**
   * 发送到期提醒
   * 应该每天运行一次
   */
  static async sendExpiryReminders(): Promise<void> {
    try {
      console.log('[Scheduler] Starting expiry reminder process...');
      
      // 获取7天内到期的订阅
      const subscriptions = await SubscriptionModel.findExpiringSoon(7);
      console.log(`[Scheduler] Found ${subscriptions.length} subscriptions expiring soon`);
      
      for (const subscription of subscriptions) {
        try {
          const daysUntilExpiry = Math.ceil(
            (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // 创建到期提醒通知
          await NotificationModel.create({
            user_id: subscription.user_id,
            subscription_id: subscription.subscription_id,
            notification_type: 'expiry_warning',
            title: '订阅即将到期',
            message: `您的 ${subscription.service_name} 订阅将在 ${daysUntilExpiry} 天后到期（${subscription.end_date}）。${subscription.auto_renew ? '已开启自动续费，将自动为您续订。' : '请及时续费以免影响使用。'}`
          });
          
          console.log(`[Scheduler] Sent expiry reminder for subscription ${subscription.subscription_id}`);
        } catch (error) {
          console.error(`[Scheduler] Error sending reminder for subscription ${subscription.subscription_id}:`, error);
        }
      }
      
      console.log('[Scheduler] Expiry reminder process completed');
    } catch (error) {
      console.error('[Scheduler] Error in expiry reminder process:', error);
    }
  }
  
  /**
   * 更新过期订阅状态
   * 应该每天运行一次
   */
  static async updateExpiredSubscriptions(): Promise<void> {
    try {
      console.log('[Scheduler] Starting expired subscription update...');
      
      const count = await SubscriptionModel.updateExpiredSubscriptions();
      console.log(`[Scheduler] Updated ${count} expired subscriptions`);
    } catch (error) {
      console.error('[Scheduler] Error updating expired subscriptions:', error);
    }
  }
  
  /**
   * 运行所有定时任务
   * 可以配置cron job每天运行此方法
   */
  static async runAllTasks(): Promise<void> {
    console.log('[Scheduler] Running all scheduled tasks...');
    
    await this.updateExpiredSubscriptions();
    await this.sendExpiryReminders();
    await this.processAutoRenewals();
    
    console.log('[Scheduler] All scheduled tasks completed');
  }
}

/**
 * 启动定时任务调度器
 * 可以配置为每天在特定时间运行
 */
export function startScheduler(): void {
  // 每24小时运行一次
  const interval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // 立即运行一次
  Scheduler.runAllTasks();
  
  // 设置定时运行
  setInterval(() => {
    Scheduler.runAllTasks();
  }, interval);
  
  console.log('[Scheduler] Scheduler started - will run every 24 hours');
}
