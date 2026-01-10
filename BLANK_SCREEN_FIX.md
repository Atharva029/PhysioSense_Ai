# Blank Screen Fix

## Common Causes of Blank Screen

### 1. Firebase Configuration Error (Most Likely)
**Problem:** Firebase tries to initialize with `undefined` values, causing the app to crash.

**Solution:** I've updated `client/src/config/firebase.js` to handle missing Firebase config gracefully. The app will now:
- Show a warning in console instead of crashing
- Continue to work without Firebase (limited functionality)
- Display the landing page normally

### 2. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors. Common errors:
- `Firebase: Error (auth/invalid-api-key)` - Missing Firebase config
- `Cannot read property 'X' of undefined` - Missing environment variables
- `Module not found` - Missing dependencies

### 3. Verify React App is Running
Check if the React app compiled successfully:
- Look for "Compiled successfully!" message in terminal
- Check that port 3000 is accessible
- Verify no build errors in terminal

### 4. Check Network Tab
In browser DevTools > Network tab:
- Verify `localhost:3000` loads successfully
- Check for failed requests (red entries)
- Ensure no CORS errors

## Quick Debug Steps

1. **Open Browser Console (F12)**
   - Look for any red error messages
   - Share the error message if you see one

2. **Check Terminal Output**
   - Look for compilation errors
   - Verify both server and client started successfully

3. **Verify Files Exist**
   ```bash
   # Check if Home.js exists
   ls client/src/pages/Home.js
   
   # Check if index.js exists
   ls client/src/index.js
   ```

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

5. **Check React DevTools**
   - Install React DevTools browser extension
   - See if React components are rendering

## If Still Blank Screen

Try accessing these URLs directly:
- http://localhost:3000/ (should show Home page)
- http://localhost:3000/login (should show Login page)
- http://localhost:5000/api/health (should return JSON)

If `/api/health` works but React pages don't, the issue is in the frontend.
If nothing works, check if the servers are actually running.

## Temporary Fix: Create Minimal .env

Create `client/.env` with placeholder values to prevent Firebase errors:

```env
REACT_APP_FIREBASE_API_KEY=demo-key
REACT_APP_FIREBASE_AUTH_DOMAIN=demo.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=demo-project
REACT_APP_FIREBASE_STORAGE_BUCKET=demo.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:demo
REACT_APP_API_URL=http://localhost:5000
```

Then restart the React app.
