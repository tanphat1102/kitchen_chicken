import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? "";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

const AUTH_TOKEN_KEY = "accessToken"; // Match authService key
const REFRESH_TOKEN_KEY = "refreshToken";

// Track if we're currently refreshing token
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

// Refresh token function
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  console.log('🔄 Refreshing access token...');

  try {
    const response = await axios.post(
      `${baseURL}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    const { data } = response.data;
    
    if (!data?.accessToken) {
      throw new Error('No access token in response');
    }

    // Save new tokens
    localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    
    // Update token expiry - use default 1 hour if not provided
    const expiresIn = data.expiresIn || 3600; // 1 hour default
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem('tokenExpiresAt', expiresAt.toString());
    console.log('🕐 Token expiry updated:', new Date(expiresAt).toLocaleString());

    console.log('✅ Token refreshed successfully');
    return data.accessToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    // Clear all auth data on refresh failure
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiresAt');
    throw error;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    const hasAuth =
      (config.headers as any)?.Authorization ??
      (config.headers as any)?.authorization;
    if (!hasAuth) {
      (config.headers as any) = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
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
        return api(originalRequest);
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

export default api;
