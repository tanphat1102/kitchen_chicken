import api from '@/config/axios';
interface Store {
  storeId: number;
  storeName: string;
}

interface Category {
  categoryId: number;
  name: string;
}

interface DailyMenuFoodItem {
  menuItemId: number;
  name: string;
  category: Category;
}

export interface DailyMenuItem {
  id: number;
  menuDate: string; 
  createdAt: string; 
  storeList: Store[];
  itemList: DailyMenuFoodItem[];
}

export interface DailyMenuResponse {
  statusCode: number;
  message: string;
  data: DailyMenuItem[];
}

const API_ENDPOINTS = {
  DAILY_MENU: '/api/daily-menu',
};

class DailyMenuService {
  private cache: Map<string, { data: DailyMenuItem[]; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.cache = new Map();
  }

  async getAllDailyMenus(token?: string): Promise<DailyMenuItem[]> {
    try {
      const cacheKey = `daily-all-${token || 'public'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: result } = await api.get<DailyMenuResponse>(
        API_ENDPOINTS.DAILY_MENU,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      if (result.statusCode === 200) {
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch daily menus');
      }
    } catch (error: any) {
      console.error('Error fetching daily menus:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  async getDailyMenuById(id: number, token?: string): Promise<DailyMenuItem | null> {
    try {
      const allMenus = await this.getAllDailyMenus(token);
      return allMenus.find(menu => menu.id === id) || null;
    } catch (error: any) {
      console.error('Error fetching daily menu by ID:', error);
      throw this.handleApiError(error);
    }
  }

  async getDailyMenuByDate(date: Date | string, token?: string): Promise<DailyMenuItem | null> {
    try {
      const allMenus = await this.getAllDailyMenus(token);
      
      let targetDate: string;
      if (date instanceof Date) {
        targetDate = date.toISOString().split('T')[0]; 
      } else {
        targetDate = date.split('T')[0]; 
      }
      
      return allMenus.find(menu => {
        const menuDateStr = menu.menuDate.split('T')[0];
        return menuDateStr === targetDate;
      }) || null;
    } catch (error: any) {
      console.error('Error fetching daily menu by date:', error);
      throw this.handleApiError(error);
    }
  }

  async getTodayDailyMenu(token?: string): Promise<DailyMenuItem | null> {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const allMenus = await this.getAllDailyMenus(token);
      return allMenus.find(menu => {
        const menuDateStr = menu.menuDate.split('T')[0];
        return menuDateStr === todayStr;
      }) || null;

    } catch (error: any) {
      console.error("Error fetching today's daily menu:", error);
      throw this.handleApiError(error);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getFromCache(key: string): DailyMenuItem[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: DailyMenuItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private handleHttpError(status: number): Error {
    let message: string;

    switch (status) {
    case 400:
        message = 'Bad request.';
        break;
    case 401:
        message = 'You need to be logged in to view daily menus. Please check your authentication token.';
        break;
    case 403:
        message = 'You do not have permission to access daily menus.';
        break;
    case 404:
        message = 'Daily menus not found.';
        break;
    case 500:
        message = 'Server error. Please try again later.';
        break;
    case 503:
        message = 'Service temporarily unavailable.';
        break;
    default:
        message = `HTTP Error: ${status}`;
    }

    return new Error(message);
  }

  private handleApiError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred while loading daily menus.');
  }
}

export const dailyMenuService = new DailyMenuService();
export default dailyMenuService;