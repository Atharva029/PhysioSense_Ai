# Quick Start Guide

Get PhysioSense AI up and running in 5 minutes!

## Prerequisites Check

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Firebase account created
- [ ] Google Cloud Platform account created

## Quick Setup

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore database
5. Copy your Firebase config

### 3. Get API Keys

**Firebase Config:**
- Project Settings > General > Your apps > Web app config

**Gemini API Key:**
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create API key

**Firebase Service Account:**
- Project Settings > Service Accounts > Generate new private key

### 4. Configure Environment Variables

**Create `server/.env`:**
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GEMINI_API_KEY=your-gemini-api-key
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
```

**Create `client/.env`:**
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000
```

### 5. Start the Application

```bash
npm run dev
```

### 6. Access the App

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 7. Create Your First Account

1. Go to http://localhost:3000
2. Click "Register"
3. Create an account
4. Start your first exercise session!

## Troubleshooting

**Port already in use?**
- Change `PORT` in `server/.env`
- Update `REACT_APP_API_URL` in `client/.env`

**Camera not working?**
- Use HTTPS in production (required for camera access)
- Check browser permissions
- Try Chrome or Firefox

**Firebase errors?**
- Verify all config values are correct
- Check that Authentication is enabled
- Ensure Firestore is created

**API errors?**
- Check that all environment variables are set
- Verify API keys are valid
- Check server logs for detailed errors

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup instructions
- Check [ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the system
- Review [API.md](./docs/API.md) for API documentation
- See [VERTEX_AI_DEPLOYMENT.md](./docs/VERTEX_AI_DEPLOYMENT.md) for advanced model deployment

## Need Help?

- Check the documentation in the `docs/` folder
- Review error messages in the browser console and server logs
- Ensure all environment variables are correctly set

Happy exercising! 🏋️‍♀️
