import api from '@/config/axios';
export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoriesResponse {
  statusCode: number;
  message: string;
  data: Category[];
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

  async getAllCategories(token?: string): Promise<Category[]> {
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
}

export const categoryService = new CategoryService();
export default categoryService;