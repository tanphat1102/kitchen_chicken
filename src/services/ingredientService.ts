import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  baseUnit: string;
  batchNumber?: string;
  imageUrl?: string;
  storeId?: number;
  storeName?: string;
  minimumStock?: number; // Added for low stock alerts
  isActive: boolean;
  createdAt?: string;
}

export interface CreateIngredientRequest {
  name: string;
  baseUnit: string; // UnitType enum
  batchNumber: string;
  quantity: number;
  storeIds: number[]; // Array of store IDs
  imageUrl?: string;
}

export interface UpdateIngredientRequest {
  name?: string;
  baseUnit?: string;
  batchNumber?: string;
  quantity?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export const ingredientService = {
  // Get all ingredients
  getAll: async (): Promise<Ingredient[]> => {
    const response = await api.get<ApiResponse<Ingredient[]>>('/ingredient');
    return response.data.data;
  },

  // Get ingredient by ID (Manager only)
  getById: async (id: number): Promise<Ingredient> => {
    const response = await api.get<ApiResponse<Ingredient>>(`/ingredient/${id}`);
    return response.data.data;
  },

  // Create new ingredient (Manager only)
  create: async (data: CreateIngredientRequest): Promise<Ingredient> => {
    const response = await api.post<ApiResponse<Ingredient>>('/ingredient', {
      name: data.name,
      baseUnit: data.baseUnit,
      createAt: new Date().toISOString(),
      imageUrl: data.imageUrl || '',
      isActive: true,
      storeIds: data.storeIds,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Update ingredient (Manager only)
  update: async (id: number, data: UpdateIngredientRequest): Promise<Ingredient> => {
    const response = await api.put<ApiResponse<Ingredient>>(`/ingredient/${id}`, {
      name: data.name,
      imageUrl: data.imageUrl,
      baseUnit: data.baseUnit || 'GRAM', // Default unit
      isActive: data.isActive ?? true,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
    });
    return response.data.data;
  },

  // Toggle ingredient status (Manager only)
  toggleStatus: async (id: number): Promise<Ingredient> => {
    const response = await api.patch<ApiResponse<Ingredient>>(`/ingredient/${id}`);
    return response.data.data;
  },

  // Delete ingredient (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ingredient/${id}`);
  },
};
