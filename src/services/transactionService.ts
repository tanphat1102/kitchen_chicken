import { api } from './api';
import type { ApiResponse } from '@/types/api.types';

export type TransactionStatus = 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: number;
  paymentId?: number;
  paymentMethodId?: number;
  transactionType: TransactionStatus;
  amount: number;
  createAt?: string;
  note?: string;
}

export const transactionService = {
  // Get all transactions (Admin only - based on Swagger comment)
  getAll: async (): Promise<Transaction[]> => {
    try {
      const response = await api.get<ApiResponse<Transaction[]>>('/transaction');
      // Check if data exists and is an array
      if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error in transactionService.getAll:', error);
      return [];
    }
  },

  // Get transaction by ID (Admin only)
  getById: async (id: number): Promise<Transaction | null> => {
    try {
      const response = await api.get<ApiResponse<Transaction>>(`/transaction/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error in transactionService.getById:', error);
      return null;
    }
  },
};
