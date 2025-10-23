import api from '@/config/axios';
export interface Nutrient {
  id: number;
  name: string;
  quantity: number;
  baseUnit?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
  price: number;
  cal?: number;
  description?: string;
  nutrients: Nutrient[];
}

export interface MenuItemResponse {
  statusCode: number;
  message: string;
  data: MenuItem;
}

const API_ENDPOINTS = {
  MENU_ITEMS: '/api/menu-items',
};

class MenuItemsService {
  private cache: Map<number, { data: MenuItem; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.cache = new Map();
  }

  async getMenuItemById(id: number, token?: string): Promise<MenuItem> {
    try {
      const cached = this.getFromCache(id);
      if (cached) {
        return cached;
      }

      const { data: result } = await api.get<MenuItemResponse>(
        `${API_ENDPOINTS.MENU_ITEMS}/${id}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      if (result.statusCode === 200) {
        this.setCache(id, result.data);
        return result.data;
      } else {
        throw new Error(result.message || `Failed to fetch menu item ${id}`);
      }
    } catch (error: any) {
      console.error(`Error fetching menu item ${id}:`, error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }


  clearCache(): void {
    this.cache.clear();
  }

  clearCacheById(id: number): void {
    this.cache.delete(id);
  }

  private getFromCache(id: number): MenuItem | null {
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(id); 
    return null;
  }

  private setCache(id: number, data: MenuItem): void {
    this.cache.set(id, {
      data,
      timestamp: Date.now(),
    });
  }

  private handleHttpError(status: number): Error {
    let message: string;
    switch (status) {
      case 404: message = 'Menu item not found.'; break;
      default: message = `HTTP Error: ${status}`;
    }
    return new Error(message);
  }

  private handleApiError(error: any): Error {
    if (error instanceof Error) return error;
    if (error.message) return new Error(error.message);
    return new Error('An unexpected error occurred.');
  }
}

export const menuItemsService = new MenuItemsService();
export default menuItemsService;