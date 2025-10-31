import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  baseUnit: string;
  unit: string; // Alias for baseUnit (for UI display)
  batchNumber?: string;
  expiryDate?: string;
  imageUrl?: string;
  storeId?: number;
  storeName?: string;
  minimumStock?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateIngredientRequest {
  name: string;
  description?: string;
  baseUnit: string; // UnitType enum
  batchNumber: string;
  quantity: number;
  storeIds: number[]; // Array of store IDs
  imageUrl?: string;
  createAt?: string;
  isActive?: boolean;
}

export interface UpdateIngredientRequest {
  name?: string;
  description?: string;
  baseUnit?: string;
  batchNumber?: string;
  quantity?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export const ingredientService = {
  // Get all ingredients with pagination
  getAll: async (pageNumber: number = 1, size: number = 10): Promise<Ingredient[]> => {
    const response = await api.get<ApiResponse<Ingredient[]>>('/api/ingredient', {
      params: { pageNumber, size }
    });
    return response.data.data;
  },

  // Get all ingredients for stats (no pagination)
  getAllForStats: async (): Promise<Ingredient[]> => {
    const response = await api.get<ApiResponse<Ingredient[]>>('/api/ingredient', {
      params: { pageNumber: 1, size: 1000 }
    });
    return response.data.data;
  },

  // Get total count
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>('/api/ingredient/counts');
    return response.data.data.total;
  },

  // Get ingredient by ID (Manager only)
  getById: async (id: number): Promise<Ingredient> => {
    const response = await api.get<ApiResponse<Ingredient>>(`/api/ingredient/${id}`);
    return response.data.data;
  },

  // Create new ingredient (Manager only)
  create: async (data: CreateIngredientRequest): Promise<Ingredient> => {
    const response = await api.post<ApiResponse<Ingredient>>('/api/ingredient', {
      name: data.name,
      description: data.description || null,
      baseUnit: data.baseUnit,
      createAt: data.createAt || new Date().toISOString(),
      imageUrl: data.imageUrl || '',
      isActive: data.isActive ?? true,
      storeIds: data.storeIds,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Update ingredient (Manager only)
  update: async (id: number, data: UpdateIngredientRequest): Promise<Ingredient> => {
    const response = await api.put<ApiResponse<Ingredient>>(`/api/ingredient/${id}`, {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      baseUnit: data.baseUnit || 'GRAM',
      isActive: data.isActive ?? true,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Toggle ingredient status (Manager only)
  toggleStatus: async (id: number): Promise<Ingredient> => {
    const response = await api.patch<ApiResponse<Ingredient>>(`/api/ingredient/${id}`);
    return response.data.data;
  },

  // Delete ingredient (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/ingredient/${id}`);
  },
};
