import {
  signInWithPopup,
  type User,
  getIdToken
} from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, githubProvider, discordProvider, twitterProvider } from '@/config/firebase';
import { AuthErrorHandler, AuthError } from '@/utils/authErrorHandler';
// import { FirestoreConnectionManager } from '@/utils/firestoreConnectionManager';

// Types
export type UserRole = 'guest' | 'member' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  role: UserRole;
  provider: 'google' | 'github' | 'discord' | 'twitter';
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

// Backend API Types
export interface FirebaseLoginRequest {
  idToken: string;
  provider: 'google' | 'github' | 'discord' | 'twitter';
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface ResponseModel<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number; // Optional vì backend không trả về
}

// API Configuration
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use Vite proxy in development
  : (import.meta.env.VITE_API_BASE_URL || 'https://chickenkitchen.milize-lena.space');

// Auth Service Class
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  // Save user info and tokens to localStorage
  private saveTokensToStorage(tokens: AuthTokens, userInfo?: any): boolean {
    try {
      console.log('💾 Starting localStorage save process...', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        hasUserInfo: !!userInfo
      });

      // Save tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      // Use default 1 hour expiry if not provided by backend
      const expiresIn = tokens.expiresIn || 3600; // 1 hour default
      localStorage.setItem('tokenExpiresAt', (Date.now() + expiresIn * 1000).toString());
      
      // Save login timestamp
      localStorage.setItem('loginTimestamp', Date.now().toString());
      
      // Save user info if provided
      if (userInfo) {
        const userInfoData = {
          uid: userInfo.uid,
          email: userInfo.email,
          displayName: userInfo.displayName,
          photoURL: userInfo.photoURL,
          provider: userInfo.provider || 'unknown',
          loginTime: new Date().toISOString(),
          // Firebase specific fields
          ...(userInfo.emailVerified !== undefined && { emailVerified: userInfo.emailVerified }),
          ...(userInfo.creationTime && { creationTime: userInfo.creationTime }),
          ...(userInfo.lastSignInTime && { lastSignInTime: userInfo.lastSignInTime }),
          ...(userInfo.phoneNumber && { phoneNumber: userInfo.phoneNumber }),
          ...(userInfo.isAnonymous !== undefined && { isAnonymous: userInfo.isAnonymous }),
          ...(userInfo.providerData && { providerData: userInfo.providerData })
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfoData));
        console.log('✅ Firebase user info saved:', userInfoData);
      }
      
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      
      // Verify immediate storage
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      const allDataSaved = storedAccessToken === tokens.accessToken && 
                          storedRefreshToken === tokens.refreshToken && 
                          (userInfo ? !!storedUserInfo : true);

      console.log('🔍 Storage verification:', {
        accessTokenMatch: storedAccessToken === tokens.accessToken,
        refreshTokenMatch: storedRefreshToken === tokens.refreshToken,
        userInfoSaved: !!storedUserInfo,
        allDataSaved
      });

      console.log('✅ Tokens and user info saved to localStorage');
      return allDataSaved;
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      return false;
    }
  }

  // Load tokens from localStorage
  private loadTokensFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt && parseInt(expiresAt) <= Date.now()) {
        console.log('🔄 Token expired, clearing storage');
        this.clearTokensFromStorage();
      } else if (this.accessToken && this.refreshToken) {
        console.log('✅ Valid tokens loaded from localStorage');
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      this.clearTokensFromStorage();
    }
  }

  // Clear all auth data from storage
  private clearTokensFromStorage(): void {
    try {
      const keysToRemove = [
        'accessToken',
        'refreshToken', 
        'tokenExpiresAt',
        'userInfo',
        'loginTimestamp'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      this.accessToken = null;
      this.refreshToken = null;
      
      console.log('🧹 All auth data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  }

  // Get user info from localStorage
  getUserInfoFromStorage(): any | null {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('❌ Error getting user info from localStorage:', error);
      return null;
    }
  }

  // Check if token is expired
  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  // Make authenticated API request
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ResponseModel<T>> {
    // Refresh token if expired
    if (this.isTokenExpired() && this.refreshToken) {
      await this.refreshAuthToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Login with Firebase provider and authenticate with backend
  private async loginWithProvider(provider: 'google' | 'github' | 'discord' | 'twitter'): Promise<User> {
    try {
      console.log(`🚀 Starting ${provider} login...`);
      
      // Prevent multiple popups
      if (this.isAuthenticated()) {
        console.log('⚠️ User already authenticated, skipping login');
        throw new Error('User already authenticated');
      }

      let authProvider;
      switch (provider) {
        case 'google':
          authProvider = googleProvider;
          break;
        case 'github':
          authProvider = githubProvider;
          break;
        case 'discord':
          authProvider = discordProvider;
          break;
        case 'twitter':
          authProvider = twitterProvider;
          break;
        default:
          throw new Error('Invalid provider');
      }

      console.log('🔥 Opening Firebase popup...');
      
      // Sign in with Firebase
      const { user } = await signInWithPopup(auth, authProvider);
      console.log('✅ Firebase popup completed:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
      
      // Get Firebase ID token
      console.log('🔑 Getting Firebase ID token...');
      const idToken = await getIdToken(user);
      console.log('✅ Firebase ID token obtained, length:', idToken.length);

      // Authenticate with backend
      console.log('🌐 Authenticating with backend...', {
        url: `${API_BASE_URL}/api/auth/login`,
        provider,
        userEmail: user.email
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          idToken,
          provider,
        } as FirebaseLoginRequest),
      });

      console.log('📥 Backend response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend authentication failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Backend authentication failed (${response.status}): ${errorText}`);
      }

      const result: ResponseModel<AuthTokens> = await response.json();
      console.log('✅ Backend authentication success:', {
        statusCode: result.statusCode,
        message: result.message,
        hasData: !!result.data,
        accessTokenLength: result.data?.accessToken?.length,
        refreshTokenLength: result.data?.refreshToken?.length
      });
      
      if (result.statusCode !== 200 || !result.data) {
        console.error('❌ Backend response validation failed:', result);
        throw new Error(result.error || result.message || 'Backend authentication failed - no data returned');
      }

      console.log('💾 Saving authentication data to localStorage...');
      
      // Use Firebase user info primarily
      const userInfoToSave = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: provider,
        emailVerified: user.emailVerified,
        // Firebase metadata
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        // Additional Firebase user properties
        phoneNumber: user.phoneNumber,
        isAnonymous: user.isAnonymous,
        providerData: user.providerData.map(p => ({
          providerId: p.providerId,
          uid: p.uid,
          displayName: p.displayName,
          email: p.email,
          photoURL: p.photoURL
        }))
      };

      console.log('👤 Firebase user info to save:', userInfoToSave);

      // Save tokens and user info to localStorage  
      const savedSuccessfully = this.saveTokensToStorage(
        {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken
          // expiresIn not provided by backend, will use default in saveTokensToStorage
        }, 
        userInfoToSave
      );

      if (!savedSuccessfully) {
        console.error('❌ Failed to save to localStorage');
        throw new Error('Failed to save authentication data');
      }

      console.log('✅ Authentication data saved successfully');

      // Verify localStorage was written
      const verifyToken = localStorage.getItem('accessToken');
      const verifyUserInfo = localStorage.getItem('userInfo');
      console.log('🔍 Verification check:', {
        hasAccessToken: !!verifyToken,
        hasUserInfo: !!verifyUserInfo,
        tokenLength: verifyToken?.length,
        userInfo: verifyUserInfo ? JSON.parse(verifyUserInfo) : null
      });

      // Create/update user document in Firestore
      const userDoc = await this.getUserDocument(user.uid);
      if (!userDoc) {
        await this.createUserDocument(user, { provider });
      }

      console.log('🎉 Login complete - User info saved to localStorage');
      return user;
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      throw AuthErrorHandler.handleError(error);
    }
  }

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    return this.loginWithProvider('google');
  }

  // Login with GitHub
  async loginWithGithub(): Promise<User> {
    return this.loginWithProvider('github');
  }

  // Login with Discord
  async loginWithDiscord(): Promise<User> {
    return this.loginWithProvider('discord');
  }

  // Login with Twitter (X)
  async loginWithTwitter(): Promise<User> {
    return this.loginWithProvider('twitter');
  }

  // Refresh JWT token
  async refreshAuthToken(): Promise<void> {
    try {
      if (!this.refreshToken) {
        console.error('❌ No refresh token available for refresh');
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        } as TokenRefreshRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Token refresh failed (${response.status}): ${errorText}`);
      }

      const result: ResponseModel<AuthTokens> = await response.json();
      
      if (result.statusCode !== 200 || !result.data) {
        throw new Error(result.error || result.message || 'Token refresh failed');
      }

      // Keep existing user info, just update tokens
      const existingUserInfo = this.getUserInfoFromStorage();
      const savedSuccessfully = this.saveTokensToStorage(result.data, existingUserInfo);
      
      if (!savedSuccessfully) {
        console.error('❌ Failed to save refreshed tokens to localStorage');
        throw new Error('Failed to save refreshed authentication data');
      }
      
      console.log('✅ Token refreshed successfully');
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      // Clear invalid tokens and user info
      this.clearTokensFromStorage();
      throw AuthErrorHandler.handleError(error);
    }
  }

  // Logout user and clean all data
  async logout(): Promise<void> {
    console.log('🚪 Starting logout process...');
    
    try {
      // Call backend logout endpoint if we have a token
      if (this.accessToken) {
        console.log('📤 Calling backend logout endpoint...');
        await this.makeAuthenticatedRequest('/api/auth/logout', {
          method: 'POST',
        });
        console.log('✅ Backend logout successful');
      }
    } catch (error) {
      console.error('❌ Backend logout error:', error);
      // Continue with local logout even if backend fails
    }

    try {
      // Sign out from Firebase
      console.log('🔥 Signing out from Firebase...');
      await auth.signOut();
      console.log('✅ Firebase logout successful');
    } catch (error) {
      console.error('❌ Firebase logout error:', error);
    }

    // Clear all local data
    console.log('🧹 Clearing all local storage data...');
    this.clearTokensFromStorage();
    
    // Additional cleanup - remove any other app-specific data
    try {
      // Clear any cached queries or app state if needed
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('chicken_kitchen_') || 
        key.startsWith('auth_') ||
        key.includes('user') ||
        key.includes('token')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('❌ Error during additional cleanup:', error);
    }
    
    console.log('✅ Logout completed successfully');
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const hasValidToken = !!this.accessToken && !this.isTokenExpired();
    const hasUserInfo = !!this.getUserInfoFromStorage();
    
    return hasValidToken && hasUserInfo;
  }

  // Get authentication status with details
  getAuthStatus(): {
    isAuthenticated: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isTokenExpired: boolean;
    userInfo: any | null;
    loginDuration?: string;
  } {
    const userInfo = this.getUserInfoFromStorage();
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    
    let loginDuration;
    if (loginTimestamp) {
      const duration = Date.now() - parseInt(loginTimestamp);
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      loginDuration = `${hours}h ${minutes}m`;
    }

    return {
      isAuthenticated: this.isAuthenticated(),
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      isTokenExpired: this.isTokenExpired(),
      userInfo,
      loginDuration
    };
  }

  // Create user document in Firestore
  private async createUserDocument(user: User, additionalData?: any): Promise<void> {
    const userData: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL,
      createdAt: new Date(),
      role: 'member',
      provider: additionalData?.provider || 'google',
      preferences: {
        theme: 'light',
        notifications: true,
      },
      ...additionalData,
    };

    try {
      // Temporarily disable Firestore operations to prevent spam requests
      console.log('📝 User document creation disabled - would create:', userData);
      /*
      await FirestoreConnectionManager.executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, userData, { merge: true });
      }, 'Create user document');
      */
    } catch (error) {
      console.error('Error creating user document:', error);
      throw new AuthError('user-creation-failed', 'Không thể tạo tài khoản người dùng. Vui lòng thử lại.', error);
    }
  }

  // Get user document from Firestore
  async getUserDocument(uid: string): Promise<UserProfile | null> {
    try {
      // Temporarily disable Firestore operations to prevent spam requests
      console.log('📖 User document fetch disabled for uid:', uid);
      return null;
      /*
      return await FirestoreConnectionManager.executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          return userDoc.data() as UserProfile;
        }
        return null;
      }, 'Get user document');
      */
    } catch (error: any) {
      console.error('Error getting user document:', error);
      
      // Handle specific Firestore errors
      if (error?.code === 'unavailable') {
        throw new AuthError('network-request-failed', 'Không thể kết nối tới Firestore. Vui lòng kiểm tra kết nối internet.', error);
      } else if (error?.code === 'permission-denied') {
        throw new AuthError('permission-denied', 'Không có quyền truy cập dữ liệu người dùng.', error);
      } else if (error?.code === 'not-found') {
        return null; // User document doesn't exist yet
      }
      
      // For other errors, return null and let the auth flow continue
      return null;
    }
  }

  // Update user role - for admin purposes
  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    try {
      const response = await this.makeAuthenticatedRequest(`/api/users/${uid}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });

      if (response.statusCode !== 200) {
        throw new Error(response.error || response.message || 'Failed to update user role');
      }

      // Also update Firestore document - Disabled to prevent spam requests
      // const userDocRef = doc(db, 'users', uid);
      // await setDoc(userDocRef, { role: newRole }, { merge: true });
      console.log('📝 Firestore user role update disabled for uid:', uid, 'role:', newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw AuthErrorHandler.handleError(error);
    }
  }

  // Get all users - for admin purposes
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await this.makeAuthenticatedRequest<UserProfile[]>('/api/users');
      
      if (response.statusCode !== 200 || !response.data) {
        throw new Error(response.error || response.message || 'Failed to fetch users');
      }

      return response.data;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw AuthErrorHandler.handleError(error);
    }
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await this.makeAuthenticatedRequest<UserProfile>('/api/auth/profile');
      
      if (response.statusCode !== 200 || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error getting current user profile:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;