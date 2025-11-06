import api from "@/config/axios";

// ==================== Interfaces ====================

export interface Step {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  stepNumber: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStepRequest {
  name: string;
  description?: string;
  categoryId: number;
  stepNumber: number;
  isActive: boolean;
}

export interface UpdateStepRequest {
  name?: string;
  description?: string;
  categoryId?: number;
  stepNumber?: number;
  isActive?: boolean;
}

// ==================== Response Models ====================

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ==================== API Endpoints ====================

const API_ENDPOINTS = {
  STEPS: "/api/steps",
  STEP_BY_ID: (id: number) => `/api/steps/${id}`,
  STEPS_COUNTS: "/api/steps/counts",
};

// ==================== Service ====================

export const stepService = {
  // Get all steps (Logged users)
  getAll: async (
    pageSize: number = 100,
    pageNumber: number = 1,
  ): Promise<Step[]> => {
    const response = await api.get<ApiResponse<Step[]>>(API_ENDPOINTS.STEPS, {
      params: { size: pageSize, pageNumber },
    });

    if (response.data.statusCode === 200) {
      return response.data.data.filter((step) => step.isActive);
    }
    throw new Error(response.data.message || "Failed to fetch steps");
  },

  // Get total count
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>('/api/steps/counts');
    return response.data.data.total;
  },

  // Get step by ID (Logged users)
  getById: async (id: number): Promise<Step> => {
    const response = await api.get<ApiResponse<Step>>(
      API_ENDPOINTS.STEP_BY_ID(id),
    );

    if (response.data.statusCode === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || `Failed to fetch step ${id}`);
  },

  // Create new step (Manager only)
  create: async (data: CreateStepRequest): Promise<Step> => {
    const response = await api.post<ApiResponse<Step>>(
      API_ENDPOINTS.STEPS,
      data,
    );

    if (response.data.statusCode === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to create step");
  },

  // Update step (Manager only)
  update: async (id: number, data: UpdateStepRequest): Promise<Step> => {
    const response = await api.put<ApiResponse<Step>>(
      API_ENDPOINTS.STEP_BY_ID(id),
      data,
    );

    if (response.data.statusCode === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update step");
  },

  // Delete step (Manager only)
  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.STEP_BY_ID(id));
  },

  // Get total steps count
  getStepsCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(
      API_ENDPOINTS.STEPS_COUNTS,
    );

    if (response.data.statusCode === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to get steps count");
  },
};
