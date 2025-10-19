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
    if (!user) return null;
    
    try {
      // Fetch user profile from Firestore to get role
      const userProfile = await authService.getUserDocument(user.uid);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: userProfile?.role || 'guest' // Default to guest if no profile found
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const authUser = await convertFirebaseUser(user);
      setCurrentUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;