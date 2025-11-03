import type {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserProfile,
  UpdateProfileRequest,
} from "@/types/api.types";
import { api } from "./api";

export const userService = {
  // Get all users with pagination support
  getAll: async (pageNumber: number = 1, pageSize: number = 10): Promise<User[]> => {
    const response = await api.get<ApiResponse<any[]>>(
      `/api/users?size=${pageSize}&pageNumber=${pageNumber}`
    );
    // Convert backend response to frontend format
    return response.data.data.map((user: any) => ({
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles, // Backend uses "roles" not "role"
      isActive: user.isActive,
      isVerified: true, // Backend doesn't return this, default to true
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    }));
  },

  // Get ALL users (no pagination) for stats calculation
  getAllForStats: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<any[]>>(
      "/api/users?size=1000&pageNumber=1" // Fetch max 1000 users for stats
    );
    // Convert backend response to frontend format
    return response.data.data.map((user: any) => ({
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles,
      isActive: user.isActive,
      isVerified: true,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    }));
  },

  // Get total count of users
  getCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ total: number }>>(
      "/api/users/counts",
    );
    return response.data.data.total;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<any>>(`/api/users/${id}`);
    const user = response.data.data;
    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles, // Backend uses "roles" not "role"
      isActive: user.isActive,
      isVerified: true, // Backend doesn't return this
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    };
  },

  // Get current user profile (logged in user)
  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<any>>("/api/users/me");
    const user = response.data.data;
    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles,
      isActive: user.isActive,
      isVerified: true,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    };
  },

  // Create new user (Admin only)
  create: async (data: CreateUserRequest): Promise<User> => {
    // Match backend CreateUserRequest format exactly
    const response = await api.post<ApiResponse<any>>("/api/users", {
      fullName: data.displayName || "",
      email: data.email,
      role: data.role,
      isActive: data.isActive ?? true,
      birthday: data.birthday || null,
      imageURL: data.imageURL || null,
    });
    const user = response.data.data;
    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles || user.role,
      isActive: user.isActive,
      isVerified: user.isVerified || false,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    };
  },

  // Update user profile
  updateMe: async (data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<ApiResponse<any>>("/api/users/me", {
      fullName: data.displayName,
      role: data.role,
      isActive: data.isActive,
      birthday: data.birthday || null,
      imageURL: data.imageURL || null,
    });
    const user = response.data.data;
    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles,
      isActive: user.isActive,
      isVerified: true,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    };
  },

  // Update user by ID (Admin only)
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    // Match backend UpdateUserRequest format
    const response = await api.put<ApiResponse<any>>(`/api/users/${id}`, {
      fullName: data.displayName,
      role: data.role,
      isActive: data.isActive,
      birthday: data.birthday || null,
      imageURL: data.imageURL || null,
    });
    const user = response.data.data;
    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles || user.role,
      isActive: user.isActive,
      isVerified: user.isVerified || false,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    };
  },

  // Toggle user status (Admin only)
  toggleStatus: async (id: string): Promise<User> => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/users/${id}/status`,
    );
    const user = response.data.data;
    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.fullName,
      role: user.roles,
      isActive: user.isActive,
      isVerified: true,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.imageURL,
      createdAt: user.createdAt || "",
    };
  },

  // Delete user by ID (Admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },

  // ===================== PROFILE (Current User) =====================
  
  // Get current user profile (any authenticated user)
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>("/api/users/me");
    return response.data.data;
  },

  // Update current user profile (any authenticated user)
  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>("/api/users/me", data);
    return response.data.data;
  },
};
