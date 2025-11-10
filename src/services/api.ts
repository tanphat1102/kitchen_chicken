import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// API Base URL
// Use proxy in development (to avoid CORS), direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Track if we're currently refreshing token
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Refresh token function
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  console.log("🔄 [api.ts] Refreshing access token...");

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const { data } = response.data;

    if (!data?.accessToken) {
      throw new Error("No access token in response");
    }

    // Save new tokens
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    // Update token expiry - use default 1 hour if not provided
    const expiresIn = data.expiresIn || 3600; // 1 hour default
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem("tokenExpiresAt", expiresAt.toString());
    console.log(
      "🕐 [api.ts] Token expiry updated:",
      new Date(expiresAt).toLocaleString(),
    );

    console.log("✅ [api.ts] Token refreshed successfully");
    return data.accessToken;
  } catch (error) {
    console.error("❌ [api.ts] Token refresh failed:", error);
    // Clear all auth data on refresh failure
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("tokenExpiresAt");
    throw error;
  }
}

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
        const accessToken = localStorage.getItem("accessToken");
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
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized - Token expired or invalid
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();

          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);

          // Retry original request
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Dispatch event to show login modal
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
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
