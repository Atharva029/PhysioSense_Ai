# PhysioSense AI - Setup Guide

## Prerequisites

Before setting up PhysioSense AI, ensure you have:

1. **Node.js** (v18 or higher) and npm installed
2. **Firebase Account** - Create a project at https://console.firebase.google.com
3. **Google Cloud Platform Account** with:
   - Vertex AI API enabled
   - Gemini API enabled
   - Billing enabled (required for Vertex AI)

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Create a **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and add a web app
   - Copy the Firebase configuration object

6. Generate a **Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

## Step 2: Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable APIs:
   - Vertex AI API
   - Gemini API (Generative AI API)
4. Set up authentication:
   - Go to IAM & Admin > Service Accounts
   - Create a service account with appropriate permissions
   - Download the service account key JSON

## Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 4: Configure Environment Variables

### Server Configuration

Create `server/.env`:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GEMINI_API_KEY=your-gemini-api-key
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
```

**To get Gemini API Key:**
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key

### Client Configuration

Create `client/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000
```

## Step 5: Firestore Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Exercise sessions
    match /exerciseSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 6: Run the Application

### Development Mode

From the root directory:

```bash
npm run dev
```

This will start both the server (port 5000) and client (port 3000).

### Production Build

```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

## Step 7: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Troubleshooting

### Camera Access Issues
- Ensure you're using HTTPS in production (required for camera access)
- Check browser permissions for camera access
- Try a different browser if issues persist

### Firebase Authentication Errors
- Verify Firebase config values are correct
- Check that Email/Password authentication is enabled
- Ensure Firestore rules allow authenticated access

### Vertex AI Errors
- Verify Vertex AI API is enabled in GCP
- Check that billing is enabled for your GCP project
- Ensure service account has proper permissions

### Gemini API Errors
- Verify API key is correct
- Check API quotas and limits
- Ensure Gemini API is enabled in your GCP project

## Next Steps

1. **Deploy to Production**:
   - Deploy backend to Google Cloud Run or similar
   - Deploy frontend to Firebase Hosting or Vercel
   - Update environment variables in production

2. **Train Custom Model** (Optional):
   - Collect exercise data
   - Train a custom model for specific exercises
   - Deploy model to Vertex AI
   - Update `server/config/vertexAI.js` with model endpoint

3. **Enhance Features**:
   - Add more exercise types
   - Improve pose estimation accuracy
   - Add video recording and playback
   - Implement exercise-specific form analysis

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
