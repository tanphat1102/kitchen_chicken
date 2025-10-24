import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export type DiscountType = 'PERCENT' | 'AMOUNT';

export interface Promotion {
  id: number;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreatePromotionRequest {
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface UpdatePromotionRequest {
  discountValue?: number;
  endDate?: string;
  quantity?: number;
  isActive?: boolean;
}

export const promotionService = {
  // Get all promotions (Manager view - internal)
  getAll: async (): Promise<Promotion[]> => {
    const response = await api.get<ApiResponse<Promotion[]>>('/promotion/internal');
    return response.data.data;
  },

  // Get all public promotions (Customer view)
  getAllPublic: async (): Promise<Promotion[]> => {
    const response = await api.get<ApiResponse<Promotion[]>>('/promotion/external');
    return response.data.data;
  },

  // Get promotion by ID
  getById: async (id: number): Promise<Promotion> => {
    const response = await api.get<ApiResponse<Promotion>>(`/promotion/${id}`);
    return response.data.data;
  },

  // Create new promotion (Manager only)
  create: async (data: CreatePromotionRequest): Promise<Promotion> => {
    const response = await api.post<ApiResponse<Promotion>>('/promotion', {
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Update promotion (Manager only)
  update: async (id: number, data: UpdatePromotionRequest): Promise<Promotion> => {
    const response = await api.put<ApiResponse<Promotion>>(`/promotion/${id}`, {
      discountValue: data.discountValue,
      endDate: data.endDate,
      isActive: data.isActive,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Toggle promotion status (Manager only)
  toggleStatus: async (id: number): Promise<Promotion> => {
    const response = await api.patch<ApiResponse<Promotion>>(`/promotion/${id}`);
    return response.data.data;
  },

  // Delete promotion (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/promotion/${id}`);
  },
};
