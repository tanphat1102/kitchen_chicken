import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AuthErrorHandler } from '@/utils/authErrorHandler';

export class FirestoreRulesChecker {
  // Test if current user can read from users collection
  static async testUserReadAccess(uid: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await getDoc(userDocRef);
      return true;
    } catch (error: any) {
      console.error('User read access test failed:', error);
      
      if (error.code === 'permission-denied') {
        AuthErrorHandler.showErrorToast(
          error,
          'Firestore Security Rules đang chặn quyền đọc. Vui lòng kiểm tra cấu hình Firebase.'
        );
      }
      
      return false;
    }
  }

  // Get detailed error info for debugging
  static getFirestoreErrorDetails(error: any): string {
    const details = {
      code: error?.code || 'unknown',
      message: error?.message || 'No message',
      stack: error?.stack || 'No stack trace'
    };
    
    return JSON.stringify(details, null, 2);
  }

  // Check if Firestore rules might be the issue
  static isRulesProblem(error: any): boolean {
    const rulesErrorCodes = [
      'permission-denied',
      'unauthenticated'
    ];
    
    return error?.code && rulesErrorCodes.includes(error.code);
  }

  // Suggest Firestore rules for development
  static getRecommendedRules(): string {
    return `
// Recommended Firestore Security Rules for development:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read their own data
    match /{document=**} {
      allow read: if request.auth != null;
    }
  }
}

// For production, make rules more restrictive!
    `;
  }
}

// Add to window for debugging in development
if (import.meta.env.DEV) {
  (window as any).FirestoreRulesChecker = FirestoreRulesChecker;
}