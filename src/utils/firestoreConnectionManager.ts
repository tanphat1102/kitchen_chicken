import { db } from '@/config/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { AuthErrorHandler } from '@/utils/authErrorHandler';

export class FirestoreConnectionManager {
  private static isOnline: boolean = true;
  private static reconnectAttempts: number = 0;
  private static maxReconnectAttempts: number = 3;
  private static reconnectDelay: number = 2000; // 2 seconds

  // Check if Firestore is connected
  static async checkConnection(): Promise<boolean> {
    try {
      // Try to enable network - this will succeed if connection is good
      await enableNetwork(db);
      this.isOnline = true;
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.warn('Firestore connection check failed:', error);
      this.isOnline = false;
      return false;
    }
  }

  // Attempt to reconnect to Firestore
  static async reconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      AuthErrorHandler.showErrorToast(
        new Error('connection-failed'),
        'Không thể kết nối tới server sau nhiều lần thử. Vui lòng kiểm tra kết nối internet và tải lại trang.'
      );
      return false;
    }

    this.reconnectAttempts++;
    
    try {
      console.log(`Attempting Firestore reconnection... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      // Disable and re-enable network connection
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await enableNetwork(db);
      
      this.isOnline = true;
      this.reconnectAttempts = 0;
      
      AuthErrorHandler.showSuccessToast(
        'Kết nối đã được khôi phục',
        'Kết nối tới server đã hoạt động trở lại'
      );
      
      return true;
    } catch (error) {
      console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
      
      // Try again if under limit
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        return this.reconnect();
      }
      
      return false;
    }
  }

  // Handle Firestore operation with auto-retry
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'Firestore operation'
  ): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      console.error(`${operationName} failed:`, error);
      
      // Check if it's a network-related error
      if (this.isNetworkError(error)) {
        AuthErrorHandler.showErrorToast(
          error,
          'Mất kết nối tới server. Đang thử kết nối lại...'
        );
        
        // Try to reconnect
        const reconnected = await this.reconnect();
        
        if (reconnected) {
          // Retry the operation after successful reconnection
          try {
            return await operation();
          } catch (retryError) {
            console.error(`${operationName} failed after reconnection:`, retryError);
            throw retryError;
          }
        }
      }
      
      throw error;
    }
  }

  // Check if error is network-related
  private static isNetworkError(error: any): boolean {
    const networkErrorCodes = [
      'unavailable',
      'deadline-exceeded', 
      'resource-exhausted',
      'internal',
      'unknown'
    ];
    
    return error?.code && networkErrorCodes.includes(error.code);
  }

  // Monitor connection status
  static startConnectionMonitoring(): void {
    // Check connection every 30 seconds
    setInterval(async () => {
      if (!this.isOnline) {
        await this.checkConnection();
      }
    }, 30000);

    // Listen for online/offline events
    window.addEventListener('online', async () => {
      console.log('Browser is back online, checking Firestore connection...');
      await this.checkConnection();
    });

    window.addEventListener('offline', () => {
      console.log('Browser is offline');
      this.isOnline = false;
    });
  }

  // Get connection status
  static getConnectionStatus(): { isOnline: boolean; reconnectAttempts: number } {
    return {
      isOnline: this.isOnline,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}