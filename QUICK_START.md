# Firebase Authentication - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Create Firebase Project (2 min)
```
1. Visit: https://console.firebase.google.com/
2. Click "Add project" → Name: "PhysioSense-AI"
3. Click "Authentication" → Enable "Email/Password"
```

### 2. Get Web App Config (1 min)
```
1. Project Settings (gear icon) → Your apps
2. Click Web icon </> → Register app
3. Copy the firebaseConfig values
```

### 3. Get Admin SDK Key (1 min)
```
1. Project Settings → Service accounts
2. Click "Generate new private key"
3. Download JSON file
```

### 4. Create Environment Files (1 min)

**Client (.env)**
```bash
cd client
cp .env.example .env
# Edit client/.env with your Firebase web config
```

**Server (.env)**
```bash
cd server
cp .env.example .env
# Edit server/.env with values from the JSON file
```

### 5. Run the App
```bash
npm run install-all
npm run dev
```

**Open:** http://localhost:3000

---

## 📋 Checklist

- [ ] Created Firebase project
- [ ] Enabled Email/Password authentication
- [ ] Got web app config
- [ ] Downloaded Admin SDK key
- [ ] Created `client/.env` with 6 Firebase variables
- [ ] Created `server/.env` with 3 Firebase variables
- [ ] Ran `npm run install-all`
- [ ] Started app with `npm run dev`
- [ ] Tested registration at http://localhost:3000/register

---

## 🎯 Environment Variables

### Client (client/.env)
```bash
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_API_URL=http://localhost:5000
```

### Server (server/.env)
```bash
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=
PORT=5000
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Firebase not configured" | Check `server/.env` exists and has all 3 variables |
| "Failed to register" | Check `client/.env` exists and has all 6 variables |
| "Invalid key" | Ensure private key has quotes and `\n` as-is |
| CORS error | Verify server is running on port 5000 |
| Can't login after register | Check browser console for errors |

---

## 📖 Full Documentation

- **Detailed Setup:** See `FIREBASE_SETUP.md`
- **Complete Guide:** See `AUTHENTICATION_SETUP_COMPLETE.md`
- **Issues Fixed:** See the "Issues Found and Fixed" section in the complete guide

---

**Need help?** Check `AUTHENTICATION_SETUP_COMPLETE.md` for detailed troubleshooting and architecture overview.
