import { api } from './api';
import type { 
  ApiResponse, 
  DailyMenu, 
  DailyMenuByStoreResponse,
  CreateDailyMenuRequest, 
  UpdateDailyMenuRequest 
} from '@/types/api.types';

export const dailyMenuService = {
  // Get all daily menus
  getAll: async (): Promise<DailyMenu[]> => {
    const response = await api.get<ApiResponse<DailyMenu[]>>('/daily-menu');
    return response.data.data;
  },

  // Get daily menu by ID
  getById: async (id: number): Promise<DailyMenu> => {
    const response = await api.get<ApiResponse<DailyMenu>>(`/daily-menu/${id}`);
    return response.data.data;
  },

  // Get daily menu by store and date (grouped by categories)
  getByStoreAndDate: async (storeId: number, date: string): Promise<DailyMenuByStoreResponse> => {
    const response = await api.get<ApiResponse<DailyMenuByStoreResponse>>(
      `/daily-menu/store/${storeId}`,
      { params: { date } }
    );
    return response.data.data;
  },

  // Create new daily menu
  create: async (data: CreateDailyMenuRequest): Promise<DailyMenu> => {
    const response = await api.post<ApiResponse<DailyMenu>>('/daily-menu', data);
    return response.data.data;
  },

  // Update daily menu
  update: async (id: number, data: UpdateDailyMenuRequest): Promise<DailyMenu> => {
    const response = await api.put<ApiResponse<DailyMenu>>(`/daily-menu/${id}`, data);
    return response.data.data;
  },

  // Delete daily menu
  delete: async (id: number): Promise<void> => {
    await api.delete(`/daily-menu/${id}`);
  },
};
