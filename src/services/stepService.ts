import api from "@/config/axios";

// ==================== Interfaces ====================

export interface Step {
  id: number;
  name: string;
  description?: string; // Optional - used in both CustomOrder.tsx and Steps.tsx
  categoryId: number;
  categoryName?: string;
  stepNumber: number;
  order?: number; // Alias for stepNumber (used in Steps.tsx)
  menuItemId?: number; // Used in Steps.tsx (optional for CustomOrder compatibility)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStepRequest {
  name?: string; // Optional for backward compatibility
  description: string;
  categoryId?: number; // Optional for backward compatibility
  menuItemId?: number; // Added for Steps.tsx
  stepNumber?: number; // Optional for backward compatibility
  order: number; // Used in Steps.tsx
  isActive?: boolean; // Optional for backward compatibility
}

export interface UpdateStepRequest {
  name?: string;
  description?: string;
  categoryId?: number;
  menuItemId?: number; // Added for Steps.tsx
  stepNumber?: number;
  order?: number; // Added for Steps.tsx
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
      // Map stepNumber to order for Steps.tsx compatibility
      return response.data.data
        .filter((step) => step.isActive)
        .map((step) => ({
          ...step,
          order: step.order ?? step.stepNumber, // Fallback to stepNumber if order not set
        }));
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

  // Change step order (for Steps.tsx)
  changeOrder: async (
    stepId: number,
    data: { newOrder: number }
  ): Promise<Step> => {
    const response = await api.put<ApiResponse<Step>>(
      `${API_ENDPOINTS.STEP_BY_ID(stepId)}/order`,
      data,
    );

    if (response.data.statusCode === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to change step order");
  },
};
