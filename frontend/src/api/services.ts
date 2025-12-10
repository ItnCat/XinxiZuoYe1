import apiClient from './index';
import type { Service, ApiResponse } from '../types';

export const serviceApi = {
  // 获取所有服务
  getAll: (status?: string) => {
    return apiClient.get<ApiResponse<Service[]>>('/services', { params: { status } });
  },

  // 获取单个服务
  getById: (id: number) => {
    return apiClient.get<ApiResponse<Service>>(`/services/${id}`);
  },

  // 创建服务
  create: (service: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<ApiResponse<{ service_id: number }>>('/services', service);
  },

  // 更新服务
  update: (id: number, service: Partial<Service>) => {
    return apiClient.put<ApiResponse>(`/services/${id}`, service);
  },

  // 删除服务
  delete: (id: number) => {
    return apiClient.delete<ApiResponse>(`/services/${id}`);
  },

  // 搜索服务
  search: (keyword: string) => {
    return apiClient.get<ApiResponse<Service[]>>('/services/search', { params: { q: keyword } });
  },
};
