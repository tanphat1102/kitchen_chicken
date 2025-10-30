import type {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "@/types/api.types";
import { api } from "./api";

export const userService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<any[]>>("/api/users");
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
};
