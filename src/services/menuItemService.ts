import { api } from './api';
import type { ApiResponse, MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types/api.types';

export const menuItemService = {
  // Get all menu items
  getAll: async (): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem[]>>('/menu-items');
    return response.data.data;
  },

  // Get menu item by ID
  getById: async (id: number): Promise<MenuItem> => {
    const response = await api.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
    return response.data.data;
  },

  // Create new menu item
  create: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post<ApiResponse<MenuItem>>('/menu-items', data);
    return response.data.data;
  },

  // Update menu item
  update: async (id: number, data: UpdateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.put<ApiResponse<MenuItem>>(`/menu-items/${id}`, data);
    return response.data.data;
  },

  // Toggle menu item status
  toggleStatus: async (id: number): Promise<MenuItem> => {
    const response = await api.patch<ApiResponse<MenuItem>>(`/menu-items/${id}/status`);
    return response.data.data;
  },

  // Delete menu item
  delete: async (id: number): Promise<void> => {
    await api.delete(`/menu-items/${id}`);
  },
};
