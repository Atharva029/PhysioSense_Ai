// Firebase configuration
// 1. Go to Firebase Console > Project Settings > General > Your Apps > SDK setup and configuration
// 2. Copy your web app config and paste it into firebaseConfig below.
// 3. DO NOT commit real keys to public repos.

const firebaseConfig = {
  apiKey: "AIzaSyClrGeSUHU_Xm1RrQDM7lvo0haZ2zGESP0",
  authDomain: "physio-ai-tracker.firebaseapp.com",
  projectId: "physio-ai-tracker",
  storageBucket: "physio-ai-tracker.firebasestorage.app",
  messagingSenderId: "412087027243",
  appId: "1:412087027243:web:233b6b95e2815ef93d0c6e",
  measurementId: "G-8JPXBC129D",
}

// Backend API base URL (for pose analysis etc.)
// Example: "https://your-backend.example.com" or "http://localhost:8000"
const API_BASE_URL = "YOUR_API_BASE_URL"

// Initialize Firebase (firebase global comes from the CDN script tags in HTML)
if (typeof firebase !== "undefined" && !firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig)
}
