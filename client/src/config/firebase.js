import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

let app;
let auth;
let db;

try {
  // Only initialize Firebase if we have real config values
  const hasRealConfig = process.env.REACT_APP_FIREBASE_API_KEY && 
                        process.env.REACT_APP_FIREBASE_API_KEY !== 'demo-api-key';
  
  if (hasRealConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('⚠️  Firebase not configured. Using demo mode. Create client/.env file with Firebase config.');
    // Create mock objects to prevent crashes
    app = null;
    auth = null;
    db = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('⚠️  Continuing without Firebase. Some features may not work.');
  app = null;
  auth = null;
  db = null;
}

export { auth, db };
export default app;
