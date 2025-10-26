import api from '@/config/axios';

// Store interface matching backend StoreResponse
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createAt: string;
}

// DTO interfaces matching backend requests
export interface CreateStoreDto {
  name: string;
  address: string;
  phone: string;
  createAt: string;
  isActive?: boolean;
}

export interface UpdateStoreDto {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const API_ENDPOINTS = {
  STORE: '/api/store',
};

class StoreService {
  private cache: Map<string, { data: Store[]; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.cache = new Map();
  }

  // Get all stores
  async getAll(token?: string): Promise<Store[]> {
    try {
      const cacheKey = 'all-stores';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: result } = await api.get<ApiResponse<Store[]>>(
        API_ENDPOINTS.STORE,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      if (result.statusCode === 200) {
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch stores');
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw new Error(`HTTP Error: ${status}`);
      throw error;
    }
  }

  // Get store by ID
  async getById(id: number): Promise<Store> {
    try {
      const { data: result } = await api.get<ApiResponse<Store>>(
        `${API_ENDPOINTS.STORE}/${id}`
      );

      if (result.statusCode === 200) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch store');
      }
    } catch (error: any) {
      console.error('Error fetching store by ID:', error);
      throw error;
    }
  }

  // Create new store
  async create(data: CreateStoreDto): Promise<Store> {
    try {
      const { data: result } = await api.post<ApiResponse<Store>>(
        API_ENDPOINTS.STORE,
        data
      );

      if (result.statusCode === 200) {
        this.cache.clear(); // Clear cache after creating
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create store');
      }
    } catch (error: any) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  // Update store
  async update(id: number, data: UpdateStoreDto): Promise<Store> {
    try {
      const { data: result } = await api.put<ApiResponse<Store>>(
        `${API_ENDPOINTS.STORE}/${id}`,
        data
      );

      if (result.statusCode === 200) {
        this.cache.clear(); // Clear cache after updating
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update store');
      }
    } catch (error: any) {
      console.error('Error updating store:', error);
      throw error;
    }
  }

  // Toggle store status
  async toggleStatus(id: number): Promise<Store> {
    try {
      const { data: result } = await api.patch<ApiResponse<Store>>(
        `${API_ENDPOINTS.STORE}/${id}`
      );

      if (result.statusCode === 200) {
        this.cache.clear(); // Clear cache after status change
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to toggle store status');
      }
    } catch (error: any) {
      console.error('Error toggling store status:', error);
      throw error;
    }
  }

  // Delete store
  async delete(id: number): Promise<void> {
    try {
      const { data: result } = await api.delete<ApiResponse<null>>(
        `${API_ENDPOINTS.STORE}/${id}`
      );

      if (result.statusCode === 200) {
        this.cache.clear(); // Clear cache after deleting
      } else {
        throw new Error(result.message || 'Failed to delete store');
      }
    } catch (error: any) {
      console.error('Error deleting store:', error);
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

// Export individual functions for backward compatibility
export const getAllStores = (token?: string) => storeService.getAll(token);
export const getStoreById = (id: number) => storeService.getById(id);
export const createStore = (data: CreateStoreDto) => storeService.create(data);
export const updateStore = (id: number, data: UpdateStoreDto) => storeService.update(id, data);
export const toggleStoreStatus = (id: number) => storeService.toggleStatus(id);
export const deleteStore = (id: number) => storeService.delete(id);

export default storeService;