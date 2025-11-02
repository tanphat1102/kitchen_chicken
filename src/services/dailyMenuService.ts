import api from '@/config/axios';
import type { CreateDailyMenuRequest, UpdateDailyMenuRequest } from '@/types/api.types';

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
  price?: number;
  cal?: number;
  imageUrl?: string;
  description?: string;
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
  DAILY_MENU_DETAIL: (id: number) => `/api/daily-menu/${id}`,
  DAILY_MENU_BY_STORE: (storeId: number) => `/api/daily-menu/store/${storeId}`,
};

class DailyMenuService {
  private cache: Map<string, { data: DailyMenuItem[]; timestamp: number }>;
  private readonly CACHE_DURATION = 10 * 60 * 1000; 

  constructor() {
    this.cache = new Map();
  }

  // Get all daily menus with pagination
  async getAllDailyMenus(pageNumber: number = 1, size: number = 10, token?: string): Promise<DailyMenuItem[]> {
    try {
      const { data: result } = await api.get<any>(
        API_ENDPOINTS.DAILY_MENU,
        {
          params: { pageNumber, size },
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
        }
      );

      // Backend returns: { statusCode, message, data: DailyMenuResponse[] }
      const raw = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      const arr: any[] = Array.isArray(raw) ? raw : [];

      const transformed: DailyMenuItem[] = arr.map((m: any) => ({
        id: m?.id,
        menuDate: m?.menuDate ? String(m.menuDate) : '', // Convert Timestamp to string
        createdAt: '', // Summary response doesn't have createdAt
        storeList: [], // Summary response doesn't have storeList
        itemList: [], // Summary response doesn't have itemList
      }));

      return transformed;
    } catch (error: any) {
      console.error('Error fetching daily menus:', error);
      const status = error?.response?.status ?? error?.status;
      
      // If 404, return empty array instead of throwing (no data in database yet)
      if (status === 404) {
        console.warn('Daily menu endpoint returned 404 - Database may be empty or endpoint not deployed');
        return [];
      }
      
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  // Get all daily menus for stats (no pagination)
  async getAllDailyMenusForStats(token?: string): Promise<DailyMenuItem[]> {
    try {
      const cacheKey = `daily-all-stats-${token || 'public'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: result } = await api.get<any>(
        API_ENDPOINTS.DAILY_MENU,
        {
          params: { pageNumber: 1, size: 1000 },
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
        }
      );

      // Backend returns: { statusCode, message, data: DailyMenuResponse[] }
      const raw = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      const arr: any[] = Array.isArray(raw) ? raw : [];

      const transformed: DailyMenuItem[] = arr.map((m: any) => ({
        id: m?.id,
        menuDate: m?.menuDate ? String(m.menuDate) : '', // Convert Timestamp to string
        createdAt: '', // Summary response doesn't have createdAt
        storeList: [], // Summary response doesn't have storeList
        itemList: [], // Summary response doesn't have itemList
      }));

      this.setCache(cacheKey, transformed);
      return transformed;
    } catch (error: any) {
      console.error('Error fetching daily menus for stats:', error);
      const status = error?.response?.status ?? error?.status;
      
      // If 404, return empty array instead of throwing
      if (status === 404) {
        console.warn('Daily menu endpoint returned 404 - Database may be empty');
        return [];
      }
      
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  // Get total count
  async getCount(token?: string): Promise<number> {
    try {
      const { data: result } = await api.get<any>(
        `${API_ENDPOINTS.DAILY_MENU}/counts`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      const data = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      return data?.total ?? 0;
    } catch (error: any) {
      console.error('Error fetching daily menu count:', error);
      throw this.handleApiError(error);
    }
  }

  async getDailyMenuById(id: number, token?: string): Promise<DailyMenuItem | null> {
    try {
      const { data: result } = await api.get<any>(
        API_ENDPOINTS.DAILY_MENU_DETAIL(id),
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      // Backend returns: { statusCode, message, data: DailyMenuDetailResponse }
      const raw = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      if (!raw) return null;

      // Backend structure: categoryList with items inside each category
      const categoryList: any[] = Array.isArray(raw?.categoryList) ? raw.categoryList : [];
      const flatItems: DailyMenuFoodItem[] = [];
      
      for (const cat of categoryList) {
        const items: any[] = Array.isArray(cat?.items) ? cat.items : [];
        for (const it of items) {
          flatItems.push({
            menuItemId: it?.id,
            name: it?.name,
            price: it?.price,
            cal: it?.cal,
            imageUrl: it?.imageUrl,
            description: it?.description,
            category: {
              categoryId: cat?.categoryId,
              name: cat?.categoryName,
            },
          });
        }
      }

      const detailed: DailyMenuItem = {
        id: raw?.id,
        menuDate: raw?.menuDate ? String(raw.menuDate) : '', // Convert Timestamp to string
        createdAt: raw?.createdAt ? String(raw.createdAt) : '', // Convert Timestamp to string
        storeList: Array.isArray(raw?.storeList) ? raw.storeList : [],
        itemList: flatItems,
      };
      return detailed;
    } catch (error: any) {
      console.error('Error fetching daily menu by ID:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  async getDailyMenuByDate(date: Date | string, token?: string): Promise<DailyMenuItem | null> {
    try {
      const allMenus = await this.getAllDailyMenusForStats(token);

      let targetDate: string;
      if (date instanceof Date) {
        targetDate = date.toISOString().split('T')[0];
      } else {
        targetDate = date.split('T')[0];
      }

      const summary = allMenus.find((menu) => (menu.menuDate || '').split('T')[0] === targetDate);
      if (!summary) return null;
      return this.getDailyMenuById(summary.id, token);
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
      
      const byDate = await this.getDailyMenuByDate(todayStr, token);
      return byDate;

    } catch (error: any) {
      console.error("Error fetching today's daily menu:", error);
      throw this.handleApiError(error);
    }
  }

  async getDailyMenuForStoreByDate(storeId: number, date: Date | string, token?: string): Promise<DailyMenuItem | null> {
    try {
      let targetDate: string;
      if (date instanceof Date) {
        targetDate = date.toISOString().split('T')[0];
      } else {
        targetDate = date.split('T')[0];
      }

      // Some backends may expect `menuDate` or even return an array; support both.
      const { data: result } = await api.get<any>(
        API_ENDPOINTS.DAILY_MENU_BY_STORE(storeId),
        {
          params: { date: targetDate, menuDate: targetDate },
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        }
      );

      let raw = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      if (!raw) return null;

      if (Array.isArray(raw)) {
        raw = raw.find((m: any) => String(m?.menuDate ?? '').split('T')[0] === targetDate) ?? raw[0];
      }

      const categoryList: any[] = Array.isArray(raw?.categoryList)
        ? raw.categoryList
        : Array.isArray(raw?.categories)
          ? raw.categories
          : [];
      const flatItems: DailyMenuFoodItem[] = [];
      for (const cat of categoryList) {
        const items: any[] = Array.isArray(cat?.items)
          ? cat.items
          : Array.isArray(cat?.itemList)
            ? cat.itemList
            : Array.isArray(cat?.menuItems)
              ? cat.menuItems
              : [];
        for (const it of items) {
          flatItems.push({
            menuItemId: it?.id ?? it?.menuItemId,
            name: it?.name,
            price: it?.price,
            cal: it?.cal ?? it?.kcal ?? it?.calories,
            imageUrl: it?.imageUrl,
            description: it?.description,
            category: {
              categoryId: cat?.categoryId ?? cat?.id,
              name: cat?.categoryName ?? cat?.name,
            },
          });
        }
      }

      const detailed: DailyMenuItem = {
        id: raw?.id ?? raw?.dailyMenuId ?? 0,
        menuDate: raw?.menuDate ?? targetDate,
        createdAt: raw?.createdAt ?? '',
        storeList: Array.isArray(raw?.storeList) ? raw.storeList : Array.isArray(raw?.stores) ? raw.stores : [],
        itemList: flatItems,
      };
      return detailed;
    } catch (error: any) {
      console.error('Error fetching daily menu by store and date:', error);
      try {
        const generic = await this.getDailyMenuByDate(date, token);
        if (generic && Array.isArray((generic as any).storeList)) {
          const ok = (generic as any).storeList.some((s: any) => s.storeId === storeId);
          if (ok) return generic;
        }
      } catch (_) {
      }
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  // CREATE - Create new daily menu
  async create(data: CreateDailyMenuRequest, token?: string): Promise<any> {
    try {
      const { data: result } = await api.post<any>(
        API_ENDPOINTS.DAILY_MENU,
        data,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      this.clearCache(); // Clear cache after creating
      return (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
    } catch (error: any) {
      console.error('Error creating daily menu:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  // UPDATE - Update existing daily menu
  async update(id: number, data: UpdateDailyMenuRequest, token?: string): Promise<any> {
    try {
      const { data: result } = await api.put<any>(
        API_ENDPOINTS.DAILY_MENU_DETAIL(id),
        data,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      this.clearCache(); // Clear cache after updating
      return (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
    } catch (error: any) {
      console.error('Error updating daily menu:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
  }

  // DELETE - Delete daily menu
  async delete(id: number, token?: string): Promise<void> {
    try {
      await api.delete<any>(
        API_ENDPOINTS.DAILY_MENU_DETAIL(id),
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      this.clearCache(); // Clear cache after deleting
    } catch (error: any) {
      console.error('Error deleting daily menu:', error);
      const status = error?.response?.status ?? error?.status;
      if (status) throw this.handleHttpError(status);
      throw this.handleApiError(error);
    }
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
        message = 'No daily menus found. The database may be empty or the endpoint is not yet deployed.';
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