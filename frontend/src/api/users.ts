import apiClient from './index';
import type { User, ApiResponse } from '../types';

export const userApi = {
  // 获取所有用户
  getAll: (params?: { limit?: number; offset?: number }) => {
    return apiClient.get<ApiResponse<User[]>>('/users', { params });
  },

  // 获取单个用户
  getById: (id: number) => {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`);
  },

  // 创建用户
  create: (user: Partial<User> & { password: string }) => {
    return apiClient.post<ApiResponse<{ user_id: number }>>('/users', user);
  },

  // 更新用户
  update: (id: number, user: Partial<User>) => {
    return apiClient.put<ApiResponse>(`/users/${id}`, user);
  },

  // 删除用户
  delete: (id: number) => {
    return apiClient.delete<ApiResponse>(`/users/${id}`);
  },

  // 搜索用户
  search: (keyword: string) => {
    return apiClient.get<ApiResponse<User[]>>('/users/search', { params: { q: keyword } });
  },
};
