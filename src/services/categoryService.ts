import api from '@/config/axios';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

interface CategoriesResponse {
  statusCode: number;
  message: string;
  data: Category[];
}

interface CategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

const API_ENDPOINTS = {
  CATEGORIES: '/api/categories',
};

class CategoryService {
  private cache: Map<string, { data: Category[]; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.cache = new Map();
  }

  // Get all categories
  async getAll(token?: string): Promise<Category[]> {
    const cacheKey = 'all-categories';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data: result } = await api.get<CategoriesResponse>(
        API_ENDPOINTS.CATEGORIES,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      if (result.statusCode === 200) {
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw new Error(`HTTP Error: ${status}`);
      throw error;
    }
  }

  // Alias for backward compatibility
  async getAllCategories(token?: string): Promise<Category[]> {
    return this.getAll(token);
  }

  // Get category by ID
  async getById(id: number): Promise<Category> {
    try {
      const { data: result } = await api.get<CategoryResponse>(
        `${API_ENDPOINTS.CATEGORIES}/${id}`
      );

      if (result.statusCode === 200) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch category');
      }
    } catch (error: any) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // Create new category
  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      const { data: result } = await api.post<CategoryResponse>(
        API_ENDPOINTS.CATEGORIES,
        dto
      );

      if (result.statusCode === 200) {
        this.clearCache();
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update category
  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const { data: result } = await api.put<CategoryResponse>(
        `${API_ENDPOINTS.CATEGORIES}/${id}`,
        dto
      );

      if (result.statusCode === 200) {
        this.clearCache();
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  async delete(id: number): Promise<void> {
    try {
      const { data: result } = await api.delete<{ statusCode: number; message: string }>(
        `${API_ENDPOINTS.CATEGORIES}/${id}`
      );

      if (result.statusCode === 200) {
        this.clearCache();
      } else {
        throw new Error(result.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  private getFromCache(key: string): Category[] | null {
     const cached = this.cache.get(key);
     if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
       return cached.data;
     }
     this.cache.delete(key);
     return null;
  }

  private setCache(key: string, data: Category[]): void {
     this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }
}

export const categoryService = new CategoryService();
export default categoryService;