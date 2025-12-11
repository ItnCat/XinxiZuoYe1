import apiClient from './index';
import type { Notification, ApiResponse } from '../types';

export const notificationApi = {
  // 获取所有通知
  getAll: (params?: { limit?: number; offset?: number }) => {
    return apiClient.get<ApiResponse<Notification[]>>('/notifications', { params });
  },

  // 获取单个通知
  getById: (id: number) => {
    return apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
  },

  // 根据用户ID获取通知
  getByUserId: (userId: number, limit?: number) => {
    return apiClient.get<ApiResponse<Notification[]>>(`/notifications/user/${userId}`, { params: { limit } });
  },

  // 获取未读通知数量
  getUnreadCount: (userId: number) => {
    return apiClient.get<ApiResponse<{ count: number }>>(`/notifications/user/${userId}/unread-count`);
  },

  // 创建通知
  create: (notification: Omit<Notification, 'notification_id' | 'sent_at' | 'read_at'>) => {
    return apiClient.post<ApiResponse<{ notification_id: number }>>('/notifications', notification);
  },

  // 标记为已读
  markAsRead: (id: number) => {
    return apiClient.put<ApiResponse>(`/notifications/${id}/read`);
  },

  // 标记所有为已读
  markAllAsRead: (userId: number) => {
    return apiClient.put<ApiResponse>(`/notifications/user/${userId}/read-all`);
  },

  // 删除通知
  delete: (id: number) => {
    return apiClient.delete<ApiResponse>(`/notifications/${id}`);
  },
};
