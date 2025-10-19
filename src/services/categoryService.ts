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
  private baseUrl: string;
  private cache: Map<string, { data: Category[]; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.baseUrl = ''; 
    this.cache = new Map();
  }

  async getAllCategories(token?: string): Promise<Category[]> {
    const cacheKey = 'all-categories';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const headers: HeadersInit = { 'accept': '*/*' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CATEGORIES}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result: CategoriesResponse = await response.json();

      if (result.statusCode === 200) {
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
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