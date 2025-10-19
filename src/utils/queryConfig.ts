import { QueryClient } from '@tanstack/react-query';
import type { DefaultOptions } from '@tanstack/react-query';
import { AuthErrorHandler } from './authErrorHandler';

// Default options for all queries
const queryConfig: DefaultOptions = {
  queries: {
    // Time before data is considered stale
    staleTime: 1000 * 60 * 5, // 5 minutes
    
    // Time before inactive queries are garbage collected
    gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.code?.includes('auth/') || error?.status === 401) {
        return false;
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus in production
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    
    // Background refetch interval (optional)
    refetchInterval: false,
    
    // Network recovery
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Global error handler for mutations
    onError: (error: any) => {
      console.error('Mutation error:', error);
      AuthErrorHandler.showErrorToast(error);
    },
  },
};

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth related queries
  auth: {
    user: () => ['auth', 'user'] as const,
    profile: (uid: string) => ['auth', 'profile', uid] as const,
  },
  
  // User management queries
  users: {
    all: () => ['users'] as const,
    byRole: (role: string) => ['users', 'role', role] as const,
    byId: (id: string) => ['users', id] as const,
  },
  
  // Menu/Food related queries (for future use)
  menu: {
    all: () => ['menu'] as const,
    categories: () => ['menu', 'categories'] as const,
    byCategory: (category: string) => ['menu', 'category', category] as const,
    item: (id: string) => ['menu', 'item', id] as const,
  },
  
  // Order related queries (for future use)
  orders: {
    all: () => ['orders'] as const,
    byUser: (userId: string) => ['orders', 'user', userId] as const,
    byStatus: (status: string) => ['orders', 'status', status] as const,
    byId: (id: string) => ['orders', id] as const,
  },
  
  // Admin analytics (for future use)
  analytics: {
    sales: () => ['analytics', 'sales'] as const,
    users: () => ['analytics', 'users'] as const,
    popular: () => ['analytics', 'popular'] as const,
  },
} as const;

// Utility functions for common operations
export const queryUtils = {
  // Invalidate auth-related queries
  invalidateAuth: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  },
  
  // Prefetch user profile
  prefetchUserProfile: async (uid: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.profile(uid),
      queryFn: () => import('@/services/authService').then(m => m.authService.getUserDocument(uid)),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  },
  
  // Set user data in cache
  setUserData: (userData: any) => {
    queryClient.setQueryData(queryKeys.auth.user(), userData);
  },
  
  // Clear all cache
  clearCache: () => {
    queryClient.clear();
  },
  
  // Remove specific query
  removeQuery: (queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
  },
};

// Error boundary for React Query
export class QueryErrorBoundary extends Error {
  originalError: any;
  queryKey?: any[];
  operation?: 'query' | 'mutation';

  constructor(
    originalError: any,
    queryKey?: any[],
    operation?: 'query' | 'mutation'
  ) {
    super(originalError?.message || 'Query error occurred');
    this.name = 'QueryErrorBoundary';
    this.originalError = originalError;
    this.queryKey = queryKey;
    this.operation = operation;
  }
}

// Custom hook for error handling in queries
export const useQueryErrorHandler = () => {
  return {
    onError: (error: any, queryKey?: any[]) => {
      console.error('Query failed:', error, queryKey);
      
      // Handle specific error types
      if (error?.code?.includes('permission-denied')) {
        AuthErrorHandler.showErrorToast(
          new Error('Bạn không có quyền truy cập dữ liệu này'),
          'Lỗi phân quyền'
        );
        return;
      }
      
      if (error?.code?.includes('unavailable')) {
        AuthErrorHandler.showErrorToast(
          new Error('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.'),
          'Lỗi kết nối'
        );
        return;
      }
      
      // Default error handling
      AuthErrorHandler.showErrorToast(error);
    },
  };
};