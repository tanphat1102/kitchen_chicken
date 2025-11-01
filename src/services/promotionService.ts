import type { ApiResponse } from "@/types/api.types";
import { api } from "./api";

export type DiscountType = "PERCENT" | "AMOUNT";

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  code?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
  usedCount?: number;
  quantityLimit?: number; // Alias for quantity
  isActive: boolean;
  createdAt?: string;
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  code?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
  isActive?: boolean;
}

export interface UpdatePromotionRequest {
  name?: string;
  description?: string;
  code?: string;
  discountValue?: number;
  endDate?: string;
  quantity?: number;
  isActive?: boolean;
}

export const promotionService = {
  // Get all promotions with pagination (Manager view)
  getAll: async (pageNumber: number = 1, size: number = 10): Promise<Promotion[]> => {
    const response = await api.get<ApiResponse<Promotion[]>>("/api/promotion", {
      params: { pageNumber, size }
    });
    return response.data.data;
  },

  // Get all promotions for stats (no pagination)
  getAllForStats: async (): Promise<Promotion[]> => {
    const response = await api.get<ApiResponse<Promotion[]>>("/api/promotion", {
      params: { pageNumber: 1, size: 1000 }
    });
    return response.data.data;
  },

  // Get total count
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>("/api/promotion/counts");
    return response.data.data.total;
  },

  // Get all public promotions (Customer view) - Same endpoint for now
  getAllPublic: async (): Promise<Promotion[]> => {
    const response = await api.get<ApiResponse<Promotion[]>>("/api/promotion");
    return response.data.data;
  },

  // Get promotion by ID
  getById: async (id: number): Promise<Promotion> => {
    const response = await api.get<ApiResponse<Promotion>>(
      `/api/promotion/${id}`,
    );
    return response.data.data;
  },

  // Create new promotion (Manager only)
  create: async (data: CreatePromotionRequest): Promise<Promotion> => {
    const response = await api.post<ApiResponse<Promotion>>("/api/promotion", {
      name: data.name,
      description: data.description || null,
      code: data.code || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Update promotion (Manager only)
  update: async (
    id: number,
    data: UpdatePromotionRequest,
  ): Promise<Promotion> => {
    const response = await api.put<ApiResponse<Promotion>>(
      `/api/promotion/${id}`,
      {
        name: data.name,
        description: data.description,
        code: data.code,
        discountValue: data.discountValue,
        endDate: data.endDate,
        isActive: data.isActive,
        quantity: data.quantity,
      },
    );
    return response.data.data;
  },

  // Toggle promotion status (Manager only)
  toggleStatus: async (id: number): Promise<Promotion> => {
    const response = await api.patch<ApiResponse<Promotion>>(
      `/api/promotion/${id}`,
    );
    return response.data.data;
  },

  // Delete promotion (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/promotion/${id}`);
  },
};
