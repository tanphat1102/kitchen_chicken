// API Response wrapper
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

// Store Types
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createAt?: string;
}

export interface CreateStoreRequest {
  name: string;
  address: string;
  phone: string;
}

export interface UpdateStoreRequest {
  name: string;
  address: string;
  phone: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

// Menu Item Types
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  cal: number;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  nutrients?: Nutrient[];
  recipes?: Recipe[];
}

export interface Nutrient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  ingredientId: number;
  ingredientName?: string;
  quantity: number;
  unit: string;
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  cal: number;
  categoryId: number;
  nutrients?: Array<{ name: string; quantity: number; unit: string }>;
  recipes?: Array<{ ingredientId: number; quantity: number; unit: string }>;
}

export interface UpdateMenuItemRequest {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  cal: number;
  categoryId: number;
}

// Daily Menu Types
export interface DailyMenu {
  id: number;
  menuDate: string;
  stores: Store[];
  dailyMenuItems: DailyMenuItem[];
}

export interface DailyMenuItem {
  id: number;
  menuItemId: number;
  menuItem?: MenuItem;
}

export interface DailyMenuByStoreResponse {
  menuDate: string;
  categories: Array<{
    categoryId: number;
    categoryName: string;
    items: MenuItem[];
  }>;
}

export interface CreateDailyMenuRequest {
  menuDate: string;
  storeIds: number[];
  menuItemIds: number[];
}

export interface UpdateDailyMenuRequest {
  menuDate: string;
  storeIds: number[];
  menuItemIds: number[];
}

// Order Types
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: number;
  userId: string;
  storeId: number;
  storeName?: string;
  totalPrice: number;
  status: OrderStatus;
  pickupTime?: string;
  createdAt?: string;
  dishes: Dish[];
}

export interface Dish {
  id: number;
  menuItemId: number;
  menuItemName?: string;
  menuItemPrice?: number;
  quantity: number;
  selections?: string;
  note?: string;
}

export interface CreateDishRequest {
  storeId: number;
  menuItemId: number;
  quantity: number;
  selections?: string;
  note?: string;
}

export interface UpdateDishRequest {
  quantity: number;
  selections?: string;
  note?: string;
}

// Ingredient Types
export interface Ingredient {
  id: number;
  name: string;
  batchNumber: string;
  baseUnit: 'G' | 'ML';
  isActive: boolean;
}

export interface CreateIngredientRequest {
  name: string;
  batchNumber: string;
  baseUnit: 'G' | 'ML';
}

export interface UpdateIngredientRequest {
  name: string;
  batchNumber: string;
  baseUnit: 'G' | 'ML';
}

// Promotion Types
export interface Promotion {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
  usedCount: number;
  isActive: boolean;
}

export interface CreatePromotionRequest {
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface UpdatePromotionRequest {
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  startDate: string;
  endDate: string;
  quantity: number;
}

// User Types
export interface User {
  id: string; // uid from Firebase
  email: string;
  displayName?: string;
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE';
  isActive: boolean;
  isVerified: boolean;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  email: string;
  displayName?: string;
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE';
  isActive?: boolean;
  birthday?: string | null;
  imageURL?: string | null;
}

export interface UpdateUserRequest {
  displayName?: string;
  role?: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE';
  isActive?: boolean;
  birthday?: string | null;
  imageURL?: string | null;
}
