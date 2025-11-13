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
const TOKEN_EXPIRY_KEY = "tokenExpiresAt";
const MAX_REFRESH_RETRIES = 1;

// Track if we're currently refreshing token
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];
// Track refresh attempts
let refreshRetryCount = 0;

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

export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

// Check if token is expired or will expire soon
function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiresAt) return true;
  
  const expiryTime = parseInt(expiresAt, 10);
  const now = Date.now();
  
  // Consider expired if less than 30 seconds remaining
  return now >= (expiryTime - 30000);
}

// Clear all auth data
function clearAuthData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("userInfo");
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  refreshRetryCount = 0;
  console.log("🧹 Cleared all auth data");
}

// Refresh token function
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    console.error("❌ No refresh token available");
    clearAuthData();
    throw new Error("No refresh token available");
  }

  // Check retry limit
  if (refreshRetryCount >= MAX_REFRESH_RETRIES) {
    console.error("❌ Max refresh retries exceeded");
    clearAuthData();
    throw new Error("Max refresh retries exceeded");
  }

  refreshRetryCount++;
  console.log(`🔄 Refreshing access token... (attempt ${refreshRetryCount}/${MAX_REFRESH_RETRIES})`);

  try {
    const response = await axios.post(
      `${baseURL}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // 10 second timeout
      },
    );

    const { data } = response.data;

    if (!data?.accessToken) {
      throw new Error("No access token in response");
    }

    // Save new tokens
    localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }

    // Update token expiry - use default 1 hour if not provided
    const expiresIn = data.expiresIn || 3600; // 1 hour default
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    
    // Reset retry count on success
    refreshRetryCount = 0;
    
    console.log("✅ Token refreshed successfully");
    console.log("🕐 Token expires at:", new Date(expiresAt).toLocaleString());
    
    return data.accessToken;
  } catch (error: any) {
    console.error("❌ Token refresh failed:", error.message || error);
    
    // Clear auth data on refresh failure
    clearAuthData();
    
    // Throw specific error for better handling
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("REFRESH_TOKEN_EXPIRED");
    }
    
    throw error;
  }
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // Skip auth for public endpoints
    const isPublicEndpoint = config.url?.includes('/api/auth/') || 
                            config.url?.includes('/api/public/');
    
    if (token && !isPublicEndpoint) {
      // Check if token is expired before making request
      if (isTokenExpired()) {
        console.warn("⚠️ Token expired, will attempt refresh on 401");
      }
      
      const hasAuth =
        (config.headers as any)?.Authorization ??
        (config.headers as any)?.authorization;
      if (!hasAuth) {
        (config.headers as any) = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip retry for public endpoints
    const isPublicEndpoint = originalRequest.url?.includes('/api/auth/') || 
                            originalRequest.url?.includes('/api/public/');

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      console.log("🔒 Received 401 Unauthorized");
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        console.log("⏳ Adding request to queue...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
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
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("🚫 Refresh failed, clearing queue and auth data");
        processQueue(refreshError, null);

        // Check if refresh token expired
        if (refreshError.message === "REFRESH_TOKEN_EXPIRED") {
          console.log("🔑 Refresh token expired, requiring login");
          // Dispatch event to show login modal
          window.dispatchEvent(new CustomEvent("auth:session-expired", {
            detail: { message: "Your session has expired. Please login again." }
          }));
        } else {
          // Other errors - still show login
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden - might indicate invalid refresh token
    if (error.response?.status === 403) {
      console.error("🚫 403 Forbidden - possible invalid token");
      clearAuthData();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default api;
