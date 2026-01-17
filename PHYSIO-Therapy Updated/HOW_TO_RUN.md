# 🚀 How to Run the PhysioSenseAI Project

## 📋 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start Backend Server
```bash
python backend_api.py
```
OR
```bash
uvicorn backend_api:app --host 0.0.0.0 --port 8000 --reload
```

### Step 3: Open Frontend
Open `PHYSIO-Therapy/index.html` in your web browser

---

## 🎯 Complete Setup Guide

### Prerequisites
- Python 3.8+ installed
- Web browser (Chrome, Firefox, Edge)
- Webcam (for exercise detection)

---

## 📁 Project Structure

```
PHYSIO-Therapy Updated/
├── backend_api.py          ← Backend server (Python/FastAPI)
├── PHYSIO-Therapy/         ← Frontend (HTML/CSS/JavaScript)
│   ├── index.html          ← Landing page
│   ├── login.html          ← Login page
│   ├── dashboard.html      ← User dashboard
│   ├── exercise.html       ← Exercise selection
│   ├── live.html           ← Live exercise with camera
│   └── js/
│       ├── config.js       ← API configuration
│       └── ...
├── Models/
│   └── squat_model.pkl     ← Trained model
└── Dataset/
    └── squat_dataset_fixed.csv
```

---

## 🔧 Step-by-Step Instructions

### 1️⃣ Install Python Dependencies

Open terminal/command prompt in the project folder:

```bash
cd "C:\Users\Sarvesh Deve\Downloads\PHYSIO-Therapy Updated"
pip install -r requirements.txt
```

**Required packages:**
- fastapi
- uvicorn
- mediapipe
- opencv-python
- numpy
- pandas
- scikit-learn
- joblib

---

### 2️⃣ Start Backend Server

**Option A: Using Python (Recommended)**
```bash
python backend_api.py
```

**Option B: Using Uvicorn directly**
```bash
uvicorn backend_api:app --host 0.0.0.0 --port 8000 --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Keep this terminal window open!** The backend must be running.

---

### 3️⃣ Open Frontend

**Option A: Direct File Opening**
1. Navigate to `PHYSIO-Therapy` folder
2. Double-click `index.html`
3. Opens in your default browser

**Option B: Using Local Server (Recommended)**
```bash
# In a new terminal window
cd PHYSIO-Therapy
python -m http.server 8080
```
Then open: `http://localhost:8080/index.html`

---

### 4️⃣ Test the Application

1. **Landing Page** → `index.html`
   - Should show PhysioSenseAI homepage

2. **Login/Signup** → `login.html` or `signup.html`
   - Create account or login

3. **Dashboard** → `dashboard.html`
   - View your stats

4. **Start Exercise** → `exercise.html`
   - Select "Squats" exercise
   - Camera will open automatically

5. **Live Exercise** → `live.html`
   - Camera should start
   - Real-time pose detection
   - Correct/Incorrect feedback

---

## 🎬 Running Different Components

### For Testing Model Only (No Web App)

```bash
python live_inference.py
```
- Opens webcam
- Shows real-time squat detection
- Press 'q' to quit

---

### For Training Model

```bash
python train_model.py
```
- Trains model on dataset
- Saves to `Models/squat_model.pkl`

---

### For Converting Data

```bash
python convert_squat_data_to_csv.py
```
- Converts .npy files to CSV

---

## ⚙️ Configuration

### Backend API URL

Edit `PHYSIO-Therapy/js/config.js`:

```javascript
const API_BASE_URL = "http://localhost:8000"
```

**If backend runs on different port, change this!**

---

## 🐛 Troubleshooting

### Problem: "ModuleNotFoundError"
**Solution:**
```bash
pip install -r requirements.txt
```

### Problem: "Port 8000 already in use"
**Solution:**
- Change port in `backend_api.py` or use:
```bash
uvicorn backend_api:app --port 8001
```
- Update `config.js` with new port

### Problem: "Camera not working"
**Solution:**
- Check browser permissions
- Use HTTPS or localhost (not file://)
- Try different browser

### Problem: "CORS error"
**Solution:**
- Make sure backend is running
- Check `API_BASE_URL` in `config.js`
- Backend should allow CORS (already configured)

### Problem: "Model not found"
**Solution:**
- Run `python train_model.py` first
- Check `Models/squat_model.pkl` exists

---

## 📊 Complete Workflow

### First Time Setup:
1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Train model: `python train_model.py`
3. ✅ Start backend: `python backend_api.py`
4. ✅ Open frontend: `PHYSIO-Therapy/index.html`

### Daily Use:
1. ✅ Start backend: `python backend_api.py`
2. ✅ Open frontend: `PHYSIO-Therapy/index.html`
3. ✅ Login and start exercising!

---

## 🎯 Quick Reference

| Task | Command | File |
|------|---------|------|
| **Start Backend** | `python backend_api.py` | `backend_api.py` |
| **Train Model** | `python train_model.py` | `train_model.py` |
| **Test Model** | `python live_inference.py` | `live_inference.py` |
| **Open Frontend** | Open `index.html` | `PHYSIO-Therapy/index.html` |

---

## ✅ Checklist

Before running:
- [ ] Python installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Model trained (`Models/squat_model.pkl` exists)
- [ ] Backend server running
- [ ] Browser ready
- [ ] Webcam connected

---

## 🚀 Ready to Go!

1. **Terminal 1:** `python backend_api.py`
2. **Browser:** Open `PHYSIO-Therapy/index.html`
3. **Start exercising!** 🎉

---

## 📞 Need Help?

- Check error messages in terminal
- Check browser console (F12)
- Verify backend is running on port 8000
- Check `API_BASE_URL` in `config.js`
