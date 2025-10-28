import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, type UserProfile } from '@/services/authService';
import { queryKeys } from '@/utils/queryConfig';
import { AuthErrorHandler } from '@/utils/authErrorHandler';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Re-export useAuth from AuthContext for convenience
export { useAuth } from '@/contexts/AuthContext';

// Hook to get current user profile with caching
export const useUserProfile = (uid?: string) => {
  const { currentUser } = useAuth();
  
  const userId = uid || currentUser?.uid;
  
  const query = useQuery({
    queryKey: queryKeys.auth.profile(userId || ''),
    queryFn: async () => {
      if (authService.isAuthenticated()) {
        return authService.getCurrentUserProfile();
      }
      return authService.getUserDocument(userId!);
    },
    enabled: !!userId, // Only run if we have a user ID
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle errors manually
  if (query.error) {
    console.error('User profile query error:', query.error);
  }

  return query;
};

// Hook to get all users (admin only)
export const useAllUsers = () => {
  const { currentUser } = useAuth();
  
  const query = useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: () => authService.getAllUsers(),
    enabled: currentUser?.role === 'admin' && authService.isAuthenticated(), // Only run for authenticated admin users
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle errors manually
  if (query.error) {
    console.error('All users query error:', query.error);
    toast.error('Không thể tải danh sách người dùng');
  }

  return query;
};

// Hook to get users by role
export const useUsersByRole = (role: string) => {
  const { currentUser } = useAuth();
  
  const query = useQuery({
    queryKey: queryKeys.users.byRole(role),
    queryFn: async () => {
      const allUsers = await authService.getAllUsers();
      return allUsers.filter(user => user.role === role);
    },
    enabled: currentUser?.role === 'admin' && !!role,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle errors manually
  if (query.error) {
    console.error('Users by role query error:', query.error);
  }

  return query;
};

// Mutation hook for updating user role (admin only)
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, newRole }: { uid: string; newRole: any }) => 
      authService.updateUserRole(uid, newRole),
    
    onSuccess: (_, { uid, newRole }) => {
      // Update the user profile in cache
      queryClient.setQueryData(
        queryKeys.auth.profile(uid),
        (oldData: UserProfile | undefined) => 
          oldData ? { ...oldData, role: newRole } : oldData
      );
      
      // Invalidate all users queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: ['users', 'role'] });
      
      AuthErrorHandler.showSuccessToast(
        'Cập nhật thành công',
        'Role người dùng đã được thay đổi'
      );
    },
    
    onError: (error: any) => {
      AuthErrorHandler.showErrorToast(
        error,
        'Không thể cập nhật role người dùng'
      );
    },
  });
};

// Mutation hook for login with Google
export const useGoogleLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.loginWithGoogle(),
    
    onSuccess: (user) => {
      // Prefetch user profile after successful login
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth.profile(user.uid),
        queryFn: () => authService.getUserDocument(user.uid),
      });
      
      AuthErrorHandler.showSuccessToast(
        'Đăng nhập thành công!',
        'Chào mừng bạn đến với Chicken Kitchen'
      );
    },
    
    onError: (error: any) => {
      AuthErrorHandler.showErrorToast(error);
    },
  });
};

// Mutation hook for login with GitHub
export const useGithubLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.loginWithGithub(),
    
    onSuccess: (user) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth.profile(user.uid),
        queryFn: () => authService.getUserDocument(user.uid),
      });
      
      AuthErrorHandler.showSuccessToast(
        'Đăng nhập thành công!',
        'Chào mừng bạn đến với Chicken Kitchen'
      );
    },
    
    onError: (error: any) => {
      AuthErrorHandler.showErrorToast(error);
    },
  });
};

// Mutation hook for login with Discord
export const useDiscordLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.loginWithDiscord(),
    
    onSuccess: (user) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth.profile(user.uid),
        queryFn: () => authService.getUserDocument(user.uid),
      });
      
      AuthErrorHandler.showSuccessToast(
        'Đăng nhập thành công!',
        'Chào mừng bạn đến với Chicken Kitchen'
      );
    },
    
    onError: (error: any) => {
      AuthErrorHandler.showErrorToast(error);
    },
  });
};

// Mutation hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: queryKeys.auth.user() });
      queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
      queryClient.removeQueries({ queryKey: queryKeys.users.all() });
      
      toast.success('Đăng xuất thành công');
    },
    
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear local cache
      queryClient.removeQueries({ queryKey: queryKeys.auth.user() });
      queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
      queryClient.removeQueries({ queryKey: queryKeys.users.all() });
      
      toast.success('Đăng xuất thành công');
    },
  });
};

// Hook to clear auth cache (for logout)
export const useClearAuthCache = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Clear all auth-related queries
    queryClient.removeQueries({ queryKey: queryKeys.auth.user() });
    queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
    queryClient.removeQueries({ queryKey: queryKeys.users.all() });
  };
};

// Hook to prefetch data for better UX
export const usePrefetchUserData = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchUserProfile: (uid: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth.profile(uid),
        queryFn: () => authService.getUserDocument(uid),
        staleTime: 1000 * 60 * 10, // 10 minutes
      });
    },
    
    prefetchAllUsers: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.users.all(),
        queryFn: () => authService.getAllUsers(),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    },
  };
};