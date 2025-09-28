// 🔥 Professional Firebase Configuration for Blog App
import { initializeApp, getApps } from "firebase/app";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Secure Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAvwGMp-rkfSS6V-aUlr7y8LR4tGAVY2uM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "blogapp-46aa1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "blogapp-46aa1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "blogapp-46aa1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "958689939223",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:958689939223:web:cdd12774edbf7ffa537152",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-JGK0M767FW"
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase Config Error:', firebaseConfig);
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase (avoid duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} else {
  app = getApps()[0];
  console.log('✅ Using existing Firebase app');
}

// Initialize Firebase Storage with proper error handling
let storage;
try {
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized');
  console.log('Storage Bucket:', firebaseConfig.storageBucket);
} catch (error) {
  console.error('❌ Firebase Storage initialization failed:', error);
  throw error;
}

// Export storage instance
export { storage };

// Export default app instance
export default app;

// 🛡️ Security & Debug Notes:
// - Fallback values provided for development
// - Proper error logging for debugging
// - Prevents duplicate initialization
// - Storage bucket URL logged for verification