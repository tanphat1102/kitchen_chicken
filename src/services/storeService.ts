export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createAt: string;
}

export interface StoreResponse {
  statusCode: number;
  message: string;
  data: Store[];
}

const API_ENDPOINTS = {
  STORE: '/api/store',
};

class StoreService {
  private baseUrl: string;
  private cache: Map<string, { data: Store[]; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.baseUrl = ''; 
    this.cache = new Map();
  }

  async getAllStores(token?: string): Promise<Store[]> {
    try {
      const cacheKey = 'all-stores';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const headers: HeadersInit = { 'accept': '*/*' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.STORE}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result: StoreResponse = await response.json();

      if (result.statusCode === 200) {
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch stores');
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  }

  private getFromCache(key: string): Store[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: Store[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

export const storeService = new StoreService();
export default storeService;