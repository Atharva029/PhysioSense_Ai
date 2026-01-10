# Troubleshooting Guide

## Common Errors and Solutions

### Error: Firebase initialization error - "Service account object must contain a string 'project_id' property"

**Cause:** Missing or incomplete Firebase environment variables in `server/.env` file.

**Solution:**
1. Create a `server/.env` file (copy from `server/.env.example` if it exists)
2. Add your Firebase credentials:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   ```

**Note:** The application will now run without Firebase configured, but Firebase-dependent features will be disabled. You'll see a warning message instead of a crash.

### Error: "The default Firebase app does not exist"

**Cause:** Firebase Admin SDK failed to initialize.

**Solution:** 
- Check that all Firebase environment variables are set correctly
- Ensure the private key includes the `\n` characters (newlines)
- The app will now continue running with a warning if Firebase is not configured

### Error: Gemini API errors

**Cause:** Missing `GEMINI_API_KEY` in environment variables.

**Solution:**
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `server/.env`:
   ```env
   GEMINI_API_KEY=your-api-key-here
   ```

**Note:** The app will use default feedback messages if Gemini API is not configured.

### Error: Port already in use

**Cause:** Another application is using port 5000 (server) or 3000 (client).

**Solution:**
1. Change the port in `server/.env`:
   ```env
   PORT=5001
   ```
2. Update `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5001
   ```

### Error: Module not found / Cannot find module

**Cause:** Dependencies not installed.

**Solution:**
```bash
npm run install-all
```

### Error: React app won't start

**Cause:** Missing client environment variables or dependencies.

**Solution:**
1. Install dependencies: `cd client && npm install`
2. Create `client/.env` file with Firebase config
3. Ensure `REACT_APP_API_URL` points to your backend

## Quick Fix Checklist

- [ ] Run `npm run install-all` to install all dependencies
- [ ] Create `server/.env` file with Firebase credentials (optional for basic testing)
- [ ] Create `client/.env` file with Firebase config
- [ ] Check that ports 3000 and 5000 are available
- [ ] Verify Node.js version is 18 or higher: `node --version`

## Running Without Full Configuration

The application can now run in a **limited mode** without Firebase or Gemini API:

- ✅ Landing page will work
- ✅ Frontend will load
- ✅ Backend API will start
- ⚠️ Authentication will return errors (needs Firebase)
- ⚠️ Exercise sessions won't save (needs Firebase)
- ⚠️ AI feedback will use default messages (needs Gemini API)

This allows you to:
- Test the UI and frontend functionality
- Develop and test features incrementally
- Set up services one at a time

## Getting Help

If you encounter other errors:
1. Check the console output for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check the documentation in the `docs/` folder
