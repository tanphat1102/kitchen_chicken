import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { authService } from '@/services/authService';
import type { UserRole } from '@/services/authService';

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
          } else if (roleFromToken === 'MANAGER' || roleFromToken === 'USER') {
            role = 'member';
          } else {
            role = 'guest';
          }
          
          console.log('🔑 User role:', role, '(from JWT:', roleFromToken + ')');
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
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Refresh user data (useful after login to get updated role)
  const refreshUser = async () => {
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser) {
      const authUser = await convertFirebaseUser(currentFirebaseUser);
      setCurrentUser(authUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const authUser = await convertFirebaseUser(user);
      setCurrentUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [convertFirebaseUser]);

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