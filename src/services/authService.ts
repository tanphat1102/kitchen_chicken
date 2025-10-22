import {
  signInWithPopup,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, githubProvider, discordProvider, db } from '@/config/firebase';

// Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  role: 'user' | 'admin';
  provider: 'google' | 'github' | 'discord';
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

// Auth Service Class
class AuthService {

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists, if not create it
      const userDoc = await this.getUserDocument(user.uid);
      if (!userDoc) {
        await this.createUserDocument(user, { provider: 'google' });
      }

      return user;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login with GitHub
  async loginWithGithub(): Promise<User> {
    try {
      const { user } = await signInWithPopup(auth, githubProvider);
      
      // Check if user document exists, if not create it
      const userDoc = await this.getUserDocument(user.uid);
      if (!userDoc) {
        await this.createUserDocument(user, { provider: 'github' });
      }

      return user;
    } catch (error: any) {
      console.error('GitHub login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login with Discord
  async loginWithDiscord(): Promise<User> {
    try {
      const { user } = await signInWithPopup(auth, discordProvider);
      
      // Check if user document exists, if not create it
      const userDoc = await this.getUserDocument(user.uid);
      if (!userDoc) {
        await this.createUserDocument(user, { provider: 'discord' });
      }

      return user;
    } catch (error: any) {
      console.error('Discord login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Create user document in Firestore
  private async createUserDocument(user: User, additionalData?: any): Promise<void> {
    const userDocRef = doc(db, 'users', user.uid);
    
    const userData: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: additionalData?.displayName || user.displayName || '',
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      role: 'user',
      provider: additionalData?.provider || 'google',
      preferences: {
        theme: 'light',
        notifications: true
      }
    };

    try {
      await setDoc(userDocRef, userData, { merge: true });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  // Get user document from Firestore
  async getUserDocument(uid: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user document:', error);
      return null;
    }
  }

  // Handle Firebase Auth errors
  private handleAuthError(error: any): Error {
    let message: string;

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Không tìm thấy tài khoản với email này.';
        break;
      case 'auth/wrong-password':
        message = 'Mật khẩu không chính xác.';
        break;
      case 'auth/email-already-in-use':
        message = 'Email này đã được sử dụng bởi tài khoản khác.';
        break;
      case 'auth/weak-password':
        message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
        break;
      case 'auth/invalid-email':
        message = 'Địa chỉ email không hợp lệ.';
        break;
      case 'auth/user-disabled':
        message = 'Tài khoản này đã bị vô hiệu hóa.';
        break;
      case 'auth/too-many-requests':
        message = 'Quá nhiều yêu cầu đăng nhập thất bại. Vui lòng thử lại sau.';
        break;
      case 'auth/network-request-failed':
        message = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Cửa sổ đăng nhập đã bị đóng.';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Yêu cầu đăng nhập đã bị hủy.';
        break;
      default:
        message = error.message || 'Đã xảy ra lỗi không xác định.';
    }

    return new Error(message);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;