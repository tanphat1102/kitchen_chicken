import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export interface Step {
  id: number;
  description: string;
  order: number;
  menuItemId: number;
  menuItemName?: string;
  createdAt?: string;
}

export interface CreateStepRequest {
  description: string;
  order: number;
  menuItemId: number;
}

export interface UpdateStepRequest {
  description?: string;
  order?: number;
}

export interface ChangeStepOrderRequest {
  newOrder: number;
}

export const stepService = {
  // Get all steps (Logged users)
  getAll: async (): Promise<Step[]> => {
    const response = await api.get<ApiResponse<Step[]>>('/steps');
    return response.data.data;
  },

  // Get step by ID (Logged users)
  getById: async (id: number): Promise<Step> => {
    const response = await api.get<ApiResponse<Step>>(`/steps/${id}`);
    return response.data.data;
  },

  // Create new step (Manager only)
  create: async (data: CreateStepRequest): Promise<Step> => {
    const response = await api.post<ApiResponse<Step>>('/steps', data);
    return response.data.data;
  },

  // Update step (Manager only)
  update: async (id: number, data: UpdateStepRequest): Promise<Step> => {
    const response = await api.put<ApiResponse<Step>>(`/steps/${id}`, data);
    return response.data.data;
  },

  // Change step order (Manager only)
  changeOrder: async (id: number, data: ChangeStepOrderRequest): Promise<Step> => {
    const response = await api.patch<ApiResponse<Step>>(`/steps/${id}/order`, data);
    return response.data.data;
  },

  // Delete step (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/steps/${id}`);
  },
};
