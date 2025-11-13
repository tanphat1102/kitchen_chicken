import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { authService } from '@/services/authService';
import type { UserRole } from '@/services/authService';
import { useQueryClient } from '@tanstack/react-query';

// Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: UserRole;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load user from localStorage on init
  const loadUserFromStorage = (): AuthUser | null => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      const accessToken = localStorage.getItem('accessToken');
      
      if (!storedUser || !accessToken) {
        return null;
      }

      const userData = JSON.parse(storedUser);
      
      // Decode JWT to get role
      let role: UserRole = 'guest';
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const roleFromToken = payload.role;
        
        if (roleFromToken === 'ADMIN') {
          role = 'admin';
        } else if (roleFromToken === 'MANAGER') {
          role = 'manager';
        } else if (roleFromToken === 'USER') {
          role = 'member';
        } else {
          role = 'guest';
        }
      } catch (decodeError) {
        console.error('❌ Error decoding JWT token:', decodeError);
      }

      const authUser: AuthUser = {
        uid: userData.uid || userData.localId || '',
        email: userData.email || null,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || userData.photoUrl || null,
        emailVerified: userData.emailVerified || false,
        role
      };
      
      return authUser;
    } catch (error) {
      console.error('❌ Error loading user from storage:', error);
      return null;
    }
  };

  // Convert Firebase User to AuthUser
  const convertFirebaseUser = async (user: User | null): Promise<AuthUser | null> => {
    if (!user) {
      return null;
    }
    
    try {
      // Get role from JWT token stored in localStorage
      const accessToken = localStorage.getItem('accessToken');
      let role: UserRole = 'guest';

      if (accessToken) {
        try {
          // Decode JWT token to get role
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const roleFromToken = payload.role;
          
          // Map backend role to frontend role
          if (roleFromToken === 'ADMIN') {
            role = 'admin';
          } else if (roleFromToken === 'MANAGER') {
            role = 'manager';
          } else if (roleFromToken === 'USER') {
            role = 'member';
          } else {
            role = 'guest';
          }
        } catch (decodeError) {
          console.error('❌ Error decoding JWT token:', decodeError);
        }
      }
      
      const authUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role
      };
      
      return authUser;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // Return user with guest role as fallback
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: 'guest'
      };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('tokenExpiry');
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Clear current user
      setCurrentUser(null);
      
      // Clear all React Query cache to prevent stale data
      queryClient.clear();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Refresh user data (useful after login to get updated role)
  const refreshUser = async () => {
    try {
      // Force reload from localStorage to get updated JWT token with role
      const storedUser = loadUserFromStorage();
      if (storedUser) {
        setCurrentUser(storedUser);
        return;
      }

      // Fallback: use Firebase user if storage is empty
      const currentFirebaseUser = auth.currentUser;
      if (currentFirebaseUser) {
        const authUser = await convertFirebaseUser(currentFirebaseUser);
        setCurrentUser(authUser);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  // Helper function to check if current route is public
  const isPublicRoute = (): boolean => {
    const currentPath = window.location.pathname;
    const PUBLIC_ROUTES = [
      "/",
      "/story",
      "/deals",
      "/menu",
      "/restaurants",
      "/register",
      "/auth-test",
      "/auth-debug",
      "/cors-test",
      "/storage-test",
      "/payment/callback",
      "/vnpay-payment-result",
      "/momo-web-return-result",
    ];
    
    // Check exact match or if path starts with /menu/ (menu detail pages)
    return PUBLIC_ROUTES.some(route => 
      currentPath === route || 
      (route === "/menu" && currentPath.startsWith("/menu/"))
    );
  };

  // Initialize user from localStorage or Firebase
  useEffect(() => {
    // First, try to load from localStorage for instant UI
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      setCurrentUser(storedUser);
      setLoading(false);
    }

    // Then set up Firebase listener for real-time updates
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const authUser = await convertFirebaseUser(user);
      setCurrentUser(authUser);
      
      // Only set loading to false if we didn't already load from storage
      if (!storedUser) {
        setLoading(false);
      }
    });

    // Listen for session expired events from axios interceptor
    const handleSessionExpired = ((event: CustomEvent) => {
      console.warn('🔐 Session expired event received');
      const message = event.detail?.message || 'Your session has expired. Please login again.';
      
      // Clear user state
      setCurrentUser(null);
      
      // Only show alert and login modal if NOT on a public page
      if (!isPublicRoute()) {
        // Show alert
        alert(message);
        
        // Trigger login modal
        window.dispatchEvent(new CustomEvent('auth:login-required'));
      } else {
        // On public pages, just log the session expiry
        console.log('🔐 Session expired on public page, login modal suppressed');
      }
    }) as EventListener;

    const handleUnauthorized = (() => {
      console.warn('🔐 Unauthorized event received');
      setCurrentUser(null);
      
      // Only trigger login modal if NOT on a public page
      if (!isPublicRoute()) {
        window.dispatchEvent(new CustomEvent('auth:login-required'));
      } else {
        console.log('🔐 Unauthorized on public page, login modal suppressed');
      }
    }) as EventListener;

    window.addEventListener('auth:session-expired', handleSessionExpired);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;