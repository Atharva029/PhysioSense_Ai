const admin = require('firebase-admin');

let db = null;
let auth = null;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if required environment variables are present
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      db = admin.firestore();
      auth = admin.auth();
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️  Firebase environment variables not set. Firebase features will be disabled.');
      console.warn('   Please create a .env file in the server directory with:');
      console.warn('   FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    console.warn('⚠️  Continuing without Firebase. Some features may not work.');
  }
} else {
  db = admin.firestore();
  auth = admin.auth();
}

module.exports = { admin, db, auth };
