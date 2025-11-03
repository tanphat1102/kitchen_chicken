import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export interface Nutrient {
  name: string;
  quantity: number;
  unit: string;
}

export interface DishStep {
  stepId: number;
  stepName: string;
  items: {
    menuItemId: number;
    menuItemName: string;
    price: number;
  }[];
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  cal: number;
  isCustom: boolean;
  createdAt: string;
  steps?: DishStep[];
  nutrients?: Nutrient[];
}

export interface DishSearchResponse {
  dishes: Dish[];
  total: number;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  cal?: number;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  cal?: number;
}

export const dishService = {
  // Get all dishes with pagination
  getAll: async (pageNumber: number = 1, size: number = 10): Promise<Dish[]> => {
    const response = await api.get<ApiResponse<Dish[]>>('/api/dishes', {
      params: { pageNumber, size }
    });
    return response.data.data;
  },

  // Get all dishes for stats (no pagination)
  getAllForStats: async (): Promise<Dish[]> => {
    const response = await api.get<ApiResponse<Dish[]>>('/api/dishes', {
      params: { pageNumber: 0, size: 0 }
    });
    return response.data.data;
  },

  // Get total count
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>('/api/dishes/counts');
    return response.data.data.total;
  },

  // Get dish by ID
  getById: async (id: number): Promise<Dish> => {
    const response = await api.get<ApiResponse<Dish>>(`/api/dishes/${id}`);
    return response.data.data;
  },

  // Create new dish
  create: async (data: CreateDishRequest): Promise<Dish> => {
    const response = await api.post<ApiResponse<Dish>>('/api/dishes', data);
    return response.data.data;
  },

  // Update dish
  update: async (id: number, data: UpdateDishRequest): Promise<Dish> => {
    const response = await api.put<ApiResponse<Dish>>(`/api/dishes/${id}`, data);
    return response.data.data;
  },

  // Delete dish
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/dishes/${id}`);
  },

  // Search dishes
  search: async (params: {
    menuItemIds?: number[];
    keyword?: string;
    minCal?: number;
    maxCal?: number;
    minPrice?: number;
    maxPrice?: number;
    pageNumber?: number;
    size?: number;
  }): Promise<DishSearchResponse> => {
    const response = await api.get<ApiResponse<DishSearchResponse>>('/api/dishes/search', {
      params: {
        menuItemIds: params.menuItemIds?.join(','),
        keyword: params.keyword,
        minCal: params.minCal,
        maxCal: params.maxCal,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        pageNumber: params.pageNumber || 1,
        size: params.size || 10,
      }
    });
    return response.data.data;
  },

  // Get my custom dishes
  getMyCustomDishes: async (): Promise<Dish[]> => {
    const response = await api.get<ApiResponse<Dish[]>>('/api/dishes/custom/mine');
    return response.data.data;
  },
};
