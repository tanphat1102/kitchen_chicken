// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and v9 modular SDK. Learn more: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Configure Firestore settings for better performance and error handling
import { enableNetwork } from "firebase/firestore";

// Enable offline persistence and better error handling
const initializeFirestore = async () => {
  try {
    // Enable network for Firestore
    await enableNetwork(db);
    console.log('Firestore network enabled successfully');
  } catch (error) {
    console.warn('Firestore network initialization warning:', error);
    // Continue anyway - might be already enabled
  }
};

// Initialize Firestore connection
initializeFirestore();

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export const discordProvider = new OAuthProvider('discord.com');
discordProvider.addScope('identify');
discordProvider.addScope('email');

// Twitter (X) provider
export const twitterProvider = new TwitterAuthProvider();
// You can customize parameters if needed, e.g. forcing login prompt
// twitterProvider.setCustomParameters({lang: 'en'});

export default app;