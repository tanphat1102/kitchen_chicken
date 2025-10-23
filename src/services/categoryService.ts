import { api } from './api';
import type { ApiResponse, Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/api.types';

export const categoryService = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  // Get category by ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  // Create new category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  // Update category
  update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  // Delete category
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
