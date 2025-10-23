// Environment configuration for API
export const ENV = {
  // API Base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://chickenkitchen.milize-lena.space/api',
  
  // Feature flags
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
  
  // API timeout
  API_TIMEOUT: 30000,
  
  // Polling intervals
  DASHBOARD_POLL_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
} as const;

// Check if running in development mode
export const isDevelopment = import.meta.env.DEV;

// Check if running in production mode
export const isProduction = import.meta.env.PROD;

// Firebase config (đã có trong firebase.ts)
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;
