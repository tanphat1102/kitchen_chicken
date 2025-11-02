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
  isActive?: boolean;
  imageUrl?: string;
  categoryId?: number;
  price?: number;
  cal?: number;
  description?: string;
  nutrients?: Array<{ nutrientId: number; quantity: number }>;
  // Note: Backend does not allow updating name (immutable)
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
  menuDate: string; // Timestamp format
  menuItemIds: number[];
  // Note: Backend automatically applies to all stores, no storeIds needed
}

export interface UpdateDailyMenuRequest {
  menuDate?: string; // Timestamp format
  storeIds?: number[];
  menuItemIds?: number[];
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
  description?: string;
  baseUnit: 'G' | 'ML'; // UnitType enum from backend
  batchNumber: string;
  quantity: number;
  storeIds: number[]; // Array of store IDs
  imageUrl?: string;
  createAt?: string; // ISO timestamp
  isActive?: boolean;
}

export interface UpdateIngredientRequest {
  name?: string;
  description?: string;
  baseUnit?: 'G' | 'ML'; // UnitType enum from backend
  batchNumber?: string;
  quantity?: number;
  imageUrl?: string;
  isActive?: boolean;
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
  displayName: string; // ✅ Required (backend's fullName is required)
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE';
  isActive: boolean;
  isVerified: boolean;
  phone?: string; // ⚠️ Note: Backend doesn't return this in UserResponse
  address?: string; // ⚠️ Note: Backend doesn't return this in UserResponse
  avatar?: string; // Maps to backend's imageURL
  createdAt?: string;
}

export interface CreateUserRequest {
  email: string;
  displayName: string; // ✅ Required to match backend's fullName (non-nullable)
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE';
  isActive?: boolean; // Backend default: true
  birthday?: string | null; // ISO date string, backend converts to LocalDate
  imageURL?: string | null;
}

export interface UpdateUserRequest {
  displayName?: string; // Maps to backend's fullName
  role?: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE';
  isActive?: boolean;
  birthday?: string | null; // ISO date string, backend converts to LocalDate
  imageURL?: string | null;
}

// User Profile Types (for /api/users/me endpoints)
export interface UserProfile {
  fullName: string;
  email: string; // Read-only, cannot be updated
  birthday?: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // Read-only
  imageURL?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  birthday?: string; // ISO date string (YYYY-MM-DD)
  imageURL?: string;
}
