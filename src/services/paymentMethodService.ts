import type { ApiResponse } from "@/types/api.types";
import { api } from "./api";

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
  description?: string;
  isActive: boolean;
}

export const paymentMethodService = {
  // Get all payment methods with pagination support
  getAll: async (pageNumber: number = 1, pageSize: number = 10): Promise<PaymentMethod[]> => {
    const response = await api.get<ApiResponse<PaymentMethod[]>>(
      `/api/transaction/payment-method?size=${pageSize}&pageNumber=${pageNumber}`,
    );
    return response.data.data;
  },

  // Get ALL payment methods (no pagination) for stats calculation
  getAllForStats: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<ApiResponse<PaymentMethod[]>>(
      "/api/transaction/payment-method?size=1000&pageNumber=1",
    );
    return response.data.data;
  },

  // Get payment method by ID
  getById: async (id: number): Promise<PaymentMethod> => {
    const response = await api.get<ApiResponse<PaymentMethod>>(
      `/api/transaction/payment-method/${id}`,
    );
    return response.data.data;
  },

  // Create new payment method (Admin only)
  create: async (data: CreatePaymentMethodRequest): Promise<PaymentMethod> => {
    const response = await api.post<ApiResponse<PaymentMethod>>(
      "/api/transaction/payment-method",
      {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? false, // Default to false to match backend
      },
    );
    return response.data.data;
  },

  // Update payment method (Admin only)
  update: async (
    id: number,
    data: UpdatePaymentMethodRequest,
  ): Promise<PaymentMethod> => {
    const response = await api.put<ApiResponse<PaymentMethod>>(
      `/api/transaction/payment-method/${id}`,
      {
        name: data.name,
        description: data.description,
        isActive: data.isActive, // Required by backend
      },
    );
    return response.data.data;
  },

  // Toggle payment method status (Admin only)
  toggleStatus: async (id: number): Promise<PaymentMethod> => {
    const response = await api.patch<ApiResponse<PaymentMethod>>(
      `/api/transaction/payment-method/${id}`,
    );
    return response.data.data;
  },

  // Delete payment method (Admin only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/transaction/payment-method/${id}`);
  },

  // Get total count of payment methods
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>(
      "/api/transaction/payment-method/counts",
    );
    return response.data.data.total;
  },
};
