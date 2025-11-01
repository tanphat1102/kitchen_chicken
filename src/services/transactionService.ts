import type { ApiResponse } from "@/types/api.types";
import { api } from "./api";

export type TransactionStatus = "CREDIT" | "DEBIT";

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
  // Get all transactions with pagination support
  getAll: async (pageNumber: number = 1, pageSize: number = 10): Promise<Transaction[]> => {
    try {
      const response =
        await api.get<ApiResponse<Transaction[]>>(
          `/api/transaction?size=${pageSize}&pageNumber=${pageNumber}`
        );
      // Check if data exists and is an array
      if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error in transactionService.getAll:", error);
      return [];
    }
  },

  // Get ALL transactions (no pagination) for stats calculation
  getAllForStats: async (): Promise<Transaction[]> => {
    try {
      const response =
        await api.get<ApiResponse<Transaction[]>>(
          "/api/transaction?size=1000&pageNumber=1"
        );
      if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error in transactionService.getAllForStats:", error);
      return [];
    }
  },

  // Get transaction by ID (Admin only)
  getById: async (id: number): Promise<Transaction | null> => {
    try {
      const response = await api.get<ApiResponse<Transaction>>(
        `/api/transaction/${id}`,
      );
      return response.data.data || null;
    } catch (error) {
      console.error("Error in transactionService.getById:", error);
      return null;
    }
  },

  // Get total count of transactions
  getCount: async (): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<{ total: number }>>(
        "/api/transaction/counts",
      );
      return response.data.data.total;
    } catch (error) {
      console.error("Error in transactionService.getCount:", error);
      return 0;
    }
  },
};
