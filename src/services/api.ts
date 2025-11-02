import { auth } from "@/config/firebase";
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// API Base URL
// Use proxy in development (to avoid CORS), direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Create Axios instance with default config
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - Add JWT token
  instance.interceptors.request.use(
    async (config) => {
      try {
        // Get JWT token from localStorage (set by authService after login)
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Error getting auth token:", error);
        // Don't block request if auth fails
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - Handle errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - Token expired or invalid
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token using refreshToken from localStorage
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            // TODO: Call backend refresh endpoint
            // For now, just clear tokens and dispatch event
            console.warn('⚠️ Token expired, clearing auth data');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            
            // Dispatch event to trigger login modal
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Export axios instance
export const api = createAxiosInstance();

/**
 * Generic API Response type
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Paginated Response type
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * API Error type
 */
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Handle API errors
 */
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || "Đã xảy ra lỗi",
      status: error.response.status,
      errors: error.response.data?.errors,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: "Không thể kết nối đến server",
    };
  } else {
    // Other errors
    return {
      message: error.message || "Đã xảy ra lỗi không xác định",
    };
  }
};

/**
 * Base API Service class
 */
export class BaseApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * GET request
   */
  async get<T>(path: string = "", config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.get(
      `${this.endpoint}${path}`,
      config,
    );
    return response.data;
  }

  /**
   * POST request
   */
  async post<T, D = any>(
    path: string = "",
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await api.post(
      `${this.endpoint}${path}`,
      data,
      config,
    );
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T, D = any>(
    path: string = "",
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await api.put(
      `${this.endpoint}${path}`,
      data,
      config,
    );
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T, D = any>(
    path: string = "",
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await api.patch(
      `${this.endpoint}${path}`,
      data,
      config,
    );
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string = "", config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.delete(
      `${this.endpoint}${path}`,
      config,
    );
    return response.data;
  }
}

export default api;
