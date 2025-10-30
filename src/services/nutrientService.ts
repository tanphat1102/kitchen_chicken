import type { ApiResponse } from "@/types/api.types";
import { api } from "./api";

export interface Nutrient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  menuItemId?: number;
  createdAt?: string;
}

export interface CreateNutrientRequest {
  name: string;
  quantity: number;
  unit: string;
  menuItemId?: number;
}

export interface UpdateNutrientRequest {
  name?: string;
  quantity?: number;
  unit?: string;
}

export const nutrientService = {
  // Get all nutrients (All actors)
  getAll: async (): Promise<Nutrient[]> => {
    const response = await api.get<ApiResponse<Nutrient[]>>("/api/nutrients");
    return response.data.data;
  },

  // Get nutrient by ID (All actors)
  getById: async (id: number): Promise<Nutrient> => {
    const response = await api.get<ApiResponse<Nutrient>>(
      `/api/nutrients/${id}`,
    );
    return response.data.data;
  },

  // Create new nutrient (Manager only)
  create: async (data: CreateNutrientRequest): Promise<Nutrient> => {
    const response = await api.post<ApiResponse<Nutrient>>(
      "/api/nutrients",
      data,
    );
    return response.data.data;
  },

  // Update nutrient (Manager only)
  update: async (
    id: number,
    data: UpdateNutrientRequest,
  ): Promise<Nutrient> => {
    const response = await api.put<ApiResponse<Nutrient>>(
      `/api/nutrients/${id}`,
      data,
    );
    return response.data.data;
  },

  // Delete nutrient (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/nutrients/${id}`);
  },
};
