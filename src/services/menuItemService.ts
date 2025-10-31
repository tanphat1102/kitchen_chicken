import { api } from './api';
import type { ApiResponse, MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types/api.types';

export const menuItemService = {
  // Get all menu items with pagination
  getAll: async (pageNumber: number = 1, size: number = 10): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem[]>>('/api/menu-items', {
      params: { pageNumber, size }
    });
    return response.data.data;
  },

  // Get all menu items for stats (no pagination)
  getAllForStats: async (): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem[]>>('/api/menu-items', {
      params: { pageNumber: 1, size: 1000 }
    });
    return response.data.data;
  },

  // Get total count
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>('/api/menu-items/counts');
    return response.data.data.total;
  },

  // Get menu item by ID
  getById: async (id: number): Promise<MenuItem> => {
    const response = await api.get<ApiResponse<MenuItem>>(`/api/menu-items/${id}`);
    return response.data.data;
  },

  // Create new menu item
  create: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post<ApiResponse<MenuItem>>('/api/menu-items', data);
    return response.data.data;
  },

  // Update menu item
  update: async (id: number, data: UpdateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.put<ApiResponse<MenuItem>>(`/api/menu-items/${id}`, data);
    return response.data.data;
  },

  // Toggle menu item status
  toggleStatus: async (id: number): Promise<MenuItem> => {
    const response = await api.patch<ApiResponse<MenuItem>>(`/api/menu-items/${id}/status`);
    return response.data.data;
  },

  // Delete menu item
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/menu-items/${id}`);
  },
};
