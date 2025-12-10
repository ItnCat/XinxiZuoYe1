import apiClient from './index';
import type { Subscription, ApiResponse } from '../types';

export const subscriptionApi = {
  // 获取所有订阅
  getAll: (params?: { limit?: number; offset?: number }) => {
    return apiClient.get<ApiResponse<Subscription[]>>('/subscriptions', { params });
  },

  // 获取单个订阅
  getById: (id: number) => {
    return apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
  },

  // 根据用户ID获取订阅
  getByUserId: (userId: number) => {
    return apiClient.get<ApiResponse<Subscription[]>>(`/subscriptions/user/${userId}`);
  },

  // 创建订阅
  create: (subscription: Omit<Subscription, 'subscription_id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<ApiResponse<{ subscription_id: number }>>('/subscriptions', subscription);
  },

  // 更新订阅
  update: (id: number, subscription: Partial<Subscription>) => {
    return apiClient.put<ApiResponse>(`/subscriptions/${id}`, subscription);
  },

  // 取消订阅
  cancel: (id: number) => {
    return apiClient.post<ApiResponse>(`/subscriptions/${id}/cancel`);
  },

  // 删除订阅
  delete: (id: number) => {
    return apiClient.delete<ApiResponse>(`/subscriptions/${id}`);
  },

  // 搜索订阅
  search: (keyword: string) => {
    return apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/search', { params: { q: keyword } });
  },

  // 获取即将到期的订阅
  getExpiringSoon: (days?: number) => {
    return apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/expiring-soon', { params: { days } });
  },

  // 处理自动续费
  processAutoRenew: () => {
    return apiClient.post<ApiResponse>('/subscriptions/auto-renew/process');
  },

  // 更新过期订阅状态
  updateExpiredStatus: () => {
    return apiClient.post<ApiResponse>('/subscriptions/update-expired');
  },
};
