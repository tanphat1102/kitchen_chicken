import { toast } from "sonner";

// Error types và messages
export const AUTH_ERROR_MESSAGES = {
  // Firebase Auth errors
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password': 'Mật khẩu không chính xác.',
  'auth/email-already-in-use': 'Email này đã được sử dụng bởi tài khoản khác.',
  'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
  'auth/too-many-requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được kích hoạt.',
  'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này.',
  'auth/credential-already-in-use': 'Tài khoản này đã được liên kết với một tài khoản khác.',
  'auth/account-exists-with-different-credential': 'Đã có tài khoản với email này sử dụng phương thức đăng nhập khác.',
  
  // Popup errors
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập. Vui lòng thử lại.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup và thử lại.',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị hủy.',
  
  // Network and server errors
  'auth/timeout': 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
  'auth/internal-error': 'Có lỗi hệ thống. Vui lòng thử lại sau.',
  
  // Custom errors
  'permission-denied': 'Bạn không có quyền thực hiện thao tác này.',
  'user-creation-failed': 'Không thể tạo tài khoản người dùng. Vui lòng thử lại.',
  'profile-update-failed': 'Không thể cập nhật thông tin cá nhân.',
  
  // Firestore specific errors
  'unavailable': 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
  'deadline-exceeded': 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
  'resource-exhausted': 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.',
  'failed-precondition': 'Dữ liệu không hợp lệ hoặc không đồng bộ.',
  'aborted': 'Thao tác bị hủy do xung đột. Vui lòng thử lại.',
  'out-of-range': 'Dữ liệu vượt quá giới hạn cho phép.',
  'data-loss': 'Mất dữ liệu không thể khôi phục.',
  
  // Connection errors
  'connection-failed': 'Không thể kết nối tới server.',
  'offline': 'Bạn đang ở chế độ offline. Vui lòng kiểm tra kết nối internet.',
  
  // Default fallback
  'unknown': 'Có lỗi không xác định xảy ra. Vui lòng thử lại.'
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

// Auth error class
export class AuthError extends Error {
  code: string;
  originalError?: any;

  constructor(code: string, message?: string, originalError?: any) {
    super(message || AUTH_ERROR_MESSAGES[code as AuthErrorCode] || AUTH_ERROR_MESSAGES.unknown);
    this.name = 'AuthError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Error handler utility
export class AuthErrorHandler {
  static handleError(error: any): AuthError {
    console.error('Auth error:', error);

    // Firebase error
    if (error?.code && typeof error.code === 'string') {
      const errorCode = error.code as AuthErrorCode;
      return new AuthError(errorCode, AUTH_ERROR_MESSAGES[errorCode], error);
    }

    // Custom AuthError
    if (error instanceof AuthError) {
      return error;
    }

    // Generic error with message
    if (error?.message) {
      return new AuthError('unknown', error.message, error);
    }

    // Fallback
    return new AuthError('unknown', undefined, error);
  }

  static showErrorToast(error: any, customMessage?: string): void {
    const authError = this.handleError(error);
    const message = customMessage || authError.message;
    
    toast.error("Lỗi đăng nhập", {
      description: message,
      duration: 5000,
    });
  }

  static showSuccessToast(message: string, description?: string): void {
    toast.success(message, {
      description,
      duration: 3000,
    });
  }

  static showLoadingToast(message: string = "Đang xử lý..."): string | number {
    return toast.loading(message);
  }

  static dismissToast(toastId: string | number): void {
    toast.dismiss(toastId);
  }

  // Helper để retry operations
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw this.handleError(error);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw this.handleError(lastError);
  }
}

// Loading state manager
export class LoadingManager {
  private static loadingStates = new Map<string, boolean>();
  private static loadingCallbacks = new Map<string, ((loading: boolean) => void)[]>();

  static setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
    const callbacks = this.loadingCallbacks.get(key) || [];
    callbacks.forEach(callback => callback(loading));
  }

  static isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  static subscribe(key: string, callback: (loading: boolean) => void): () => void {
    if (!this.loadingCallbacks.has(key)) {
      this.loadingCallbacks.set(key, []);
    }
    this.loadingCallbacks.get(key)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.loadingCallbacks.get(key) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
}