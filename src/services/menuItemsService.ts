// Types
export interface MenuItem {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  imageUrl: string;
}

export interface MenuItemsResponse {
  statusCode: number;
  message: string;
  data: MenuItem[];
}

export interface MenuItemsFilter {
  categoryId?: number;
  isActive?: boolean;
  search?: string;
}

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://chickenkitchen.milize-lena.space/api'
  : '/api';
const API_ENDPOINTS = {
  MENU_ITEMS: '/menu-items',
};

// Menu Items Service Class
class MenuItemsService {
  private baseUrl: string;
  private cache: Map<string, { data: MenuItem[]; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.cache = new Map();
  }

  /**
   * Get all menu items from API
   * @param token - Optional Bearer token for authentication
   * @returns Promise with array of menu items
   */
  async getAllMenuItems(token?: string): Promise<MenuItem[]> {
    try {
      // Check cache first
      const cacheKey = `all-${token || 'public'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const headers: HeadersInit = {
        'accept': '*/*',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MENU_ITEMS}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw this.handleHttpError(response.status);
      }

      const result: MenuItemsResponse = await response.json();

      if (result.statusCode === 200) {
        // Cache the result
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch menu items');
      }
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get menu items filtered by category
   * @param categoryId - Category ID to filter by
   * @param token - Optional Bearer token for authentication
   * @returns Promise with filtered menu items
   */
  async getMenuItemsByCategory(categoryId: number, token?: string): Promise<MenuItem[]> {
    try {
      const allItems = await this.getAllMenuItems(token);
      return allItems.filter(item => item.categoryId === categoryId);
    } catch (error: any) {
      console.error('Error fetching menu items by category:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get only active menu items
   * @param token - Optional Bearer token for authentication
   * @returns Promise with active menu items
   */
  async getActiveMenuItems(token?: string): Promise<MenuItem[]> {
    try {
      const allItems = await this.getAllMenuItems(token);
      return allItems.filter(item => item.isActive);
    } catch (error: any) {
      console.error('Error fetching active menu items:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get a single menu item by ID
   * @param id - Menu item ID
   * @param token - Optional Bearer token for authentication
   * @returns Promise with menu item or null if not found
   */
  async getMenuItemById(id: number, token?: string): Promise<MenuItem | null> {
    try {
      const allItems = await this.getAllMenuItems(token);
      return allItems.find(item => item.id === id) || null;
    } catch (error: any) {
      console.error('Error fetching menu item by ID:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get menu items with multiple filters
   * @param filters - Filter criteria
   * @param token - Optional Bearer token for authentication
   * @returns Promise with filtered menu items
   */
  async getFilteredMenuItems(filters: MenuItemsFilter, token?: string): Promise<MenuItem[]> {
    try {
      let items = await this.getAllMenuItems(token);

      // Filter by category
      if (filters.categoryId !== undefined) {
        items = items.filter(item => item.categoryId === filters.categoryId);
      }

      // Filter by active status
      if (filters.isActive !== undefined) {
        items = items.filter(item => item.isActive === filters.isActive);
      }

      // Filter by search term
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.categoryName.toLowerCase().includes(searchLower)
        );
      }

      return items;
    } catch (error: any) {
      console.error('Error filtering menu items:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get unique categories from menu items
   * @param token - Optional Bearer token for authentication
   * @returns Promise with array of unique categories
   */
  async getCategories(token?: string): Promise<Array<{ id: number; name: string }>> {
    try {
      const allItems = await this.getAllMenuItems(token);
      const categoriesMap = new Map<number, string>();

      allItems.forEach(item => {
        if (!categoriesMap.has(item.categoryId)) {
          categoriesMap.set(item.categoryId, item.categoryName);
        }
      });

      return Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get data from cache if still valid
   */
  private getFromCache(key: string): MenuItem[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Save data to cache
   */
  private setCache(key: string, data: MenuItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleHttpError(status: number): Error {
    let message: string;

    switch (status) {
    case 400:
        message = 'Bad request.';
        break;
    case 401:
        message = 'You need to be logged in to view menu items. Please check your authentication token.';
        break;
    case 403:
        message = 'You do not have permission to access menu items.';
        break;
    case 404:
        message = 'Menu items not found.';
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

  /**
   * Handle API errors
   */
  private handleApiError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred while loading menu items.');
  }
}

export const menuItemsService = new MenuItemsService();
export default menuItemsService;
