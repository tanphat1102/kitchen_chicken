import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
  description?: string;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
  description?: string;
}

export const paymentMethodService = {
  // Get all payment methods
  getAll: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<ApiResponse<PaymentMethod[]>>('/transaction/payment-method');
    return response.data.data;
  },

  // Get payment method by ID
  getById: async (id: number): Promise<PaymentMethod> => {
    const response = await api.get<ApiResponse<PaymentMethod>>(`/transaction/payment-method/${id}`);
    return response.data.data;
  },

  // Create new payment method (Admin only)
  create: async (data: CreatePaymentMethodRequest): Promise<PaymentMethod> => {
    const response = await api.post<ApiResponse<PaymentMethod>>('/transaction/payment-method', {
      name: data.name,
      description: data.description || '',
      isActive: true, // Default to active
    });
    return response.data.data;
  },

  // Update payment method (Admin only)
  update: async (id: number, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> => {
    const response = await api.put<ApiResponse<PaymentMethod>>(`/transaction/payment-method/${id}`, {
      name: data.name,
      description: data.description,
      isActive: true, // Backend requires this field
    });
    return response.data.data;
  },

  // Toggle payment method status (Admin only)
  toggleStatus: async (id: number): Promise<PaymentMethod> => {
    const response = await api.patch<ApiResponse<PaymentMethod>>(`/transaction/payment-method/${id}`);
    return response.data.data;
  },

  // Delete payment method (Admin only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/transaction/payment-method/${id}`);
  },
};
