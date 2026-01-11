# Firebase Authentication Setup Guide

## Prerequisites
- A Google account
- Node.js installed on your machine

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "PhysioSense-AI")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In the Firebase Console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 3: Get Firebase Config for Client (React)

1. In the Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app with a nickname (e.g., "PhysioSense Client")
6. Copy the `firebaseConfig` object
7. Create a `.env` file in the `client` folder:
   ```bash
   cd client
   cp .env.example .env
   ```
8. Fill in the values from the `firebaseConfig` object

## Step 4: Get Firebase Admin SDK for Server (Node.js)

1. In Firebase Console → Project Settings
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" - this downloads a JSON file
5. Open the downloaded JSON file
6. Create a `.env` file in the `server` folder:
   ```bash
   cd server
   cp .env.example .env
   ```
7. Fill in the values:
   - `FIREBASE_PROJECT_ID`: Copy from `project_id` field
   - `FIREBASE_CLIENT_EMAIL`: Copy from `client_email` field
   - `FIREBASE_PRIVATE_KEY`: Copy from `private_key` field (keep the quotes and newlines)

## Step 5: Install Dependencies

```bash
# Install all dependencies
npm run install-all

# Or manually:
cd client && npm install
cd ../server && npm install
```

## Step 6: Start the Application

```bash
# From the root directory
npm run dev

# Or manually:
# Terminal 1 - Start server
cd server && npm run dev

# Terminal 2 - Start client
cd client && npm start
```

## Step 7: Test Authentication

1. Open http://localhost:3000 in your browser
2. Click "Register" or "Get Started"
3. Create an account with email and password
4. You should be redirected to the dashboard
5. Try logging out and logging back in

## Troubleshooting

### Common Issues and Fixes

#### 1. "Firebase not configured" error
- Make sure your `.env` files exist in both `client` and `server` directories
- Verify all environment variables are set correctly
- Restart both the client and server after adding .env files

#### 2. "Failed to register" error
- Check the browser console for specific error messages
- Verify Firebase Authentication is enabled in Firebase Console
- Make sure the server is running on port 5000

#### 3. Private key format issues
- The `FIREBASE_PRIVATE_KEY` must include the full key with headers
- Keep the quotes around the key
- The `\n` characters should remain as literal `\n` (not actual newlines)

#### 4. CORS errors
- Ensure the server's CORS configuration allows requests from localhost:3000
- Check that `REACT_APP_API_URL` is set correctly in client/.env

## Security Notes

- **NEVER** commit `.env` files to version control
- The `.env` files are already in `.gitignore`
- Keep your Firebase service account key secure
- Consider using environment-specific configurations for production

## Additional Features

### Add More Authentication Providers

To add Google Sign-In, GitHub, etc.:
1. Enable the provider in Firebase Console → Authentication → Sign-in method
2. Update the client code to include the new provider's sign-in method
3. No server changes needed - Firebase handles it!

### Email Verification

To require email verification:
1. In `client/src/contexts/AuthContext.js`, add email verification after registration
2. Send verification email using `sendEmailVerification(user)`

### Password Reset

Already supported! Use Firebase's built-in password reset:
```javascript
import { sendPasswordResetEmail } from 'firebase/auth';
sendPasswordResetEmail(auth, email);
```
