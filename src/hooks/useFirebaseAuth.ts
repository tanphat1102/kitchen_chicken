import { useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface FirebaseAuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userInfo: any | null; // localStorage user info
}

export const useFirebaseAuth = (): FirebaseAuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, 
      (firebaseUser) => {
        console.log('🔥 Firebase auth state changed:', {
          hasUser: !!firebaseUser,
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          displayName: firebaseUser?.displayName
        });
        
        setUser(firebaseUser);
        setLoading(false);
        
        if (firebaseUser) {
          // Load user info from localStorage when Firebase user is available
          try {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
              const parsedUserInfo = JSON.parse(storedUserInfo);
              setUserInfo(parsedUserInfo);
              console.log('📱 Loaded user info from localStorage:', parsedUserInfo);
            }
          } catch (error) {
            console.error('❌ Error loading user info from localStorage:', error);
          }
        } else {
          // Clear user info when no Firebase user
          setUserInfo(null);
          console.log('🧹 Cleared user info - no Firebase user');
        }
        
        setError(null);
      },
      (err) => {
        console.error('❌ Firebase auth error:', err);
        setError(err.message);
        setLoading(false);
        setUser(null);
        setUserInfo(null);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Also listen to localStorage changes for userInfo
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userInfo' && user) {
        try {
          const storedUserInfo = localStorage.getItem('userInfo');
          if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            setUserInfo(parsedUserInfo);
            console.log('📱 Updated user info from storage event:', parsedUserInfo);
          } else {
            setUserInfo(null);
            console.log('🧹 Cleared user info from storage event');
          }
        } catch (error) {
          console.error('❌ Error parsing user info from storage event:', error);
        }
      }
    };

    // Listen to storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    userInfo
  };
};