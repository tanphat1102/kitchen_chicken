import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';

// Types
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  role: 'user' | 'admin';
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

// Auth Service Class
class AuthService {
  // Register with email and password
  async register({ email, password, displayName }: RegisterData): Promise<User> {
    try {
      // Create user account
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: displayName
      });

      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });

      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login with email and password
  async login({ email, password }: LoginData): Promise<User> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists, if not create it
      const userDoc = await this.getUserDocument(user.uid);
      if (!userDoc) {
        await this.createUserDocument(user);
      }

      return user;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
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