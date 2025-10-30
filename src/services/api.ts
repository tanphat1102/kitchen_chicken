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
        // TEMPORARY: Skip auth in development since backend endpoints are public
        // TODO: Re-enable when backend security is configured
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
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

      // Handle 401 Unauthorized - Token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            // Force refresh token
            const newToken = await currentUser.getIdToken(true);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Redirect to login if refresh fails
          window.location.href = "/login";
          return Promise.reject(refreshError);
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
