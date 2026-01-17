# ⚡ Quick Run Guide - PhysioSenseAI

## 🎯 The Simplest Way to Run

### **Step 1: Install Dependencies** (One-time setup)
```bash
pip install -r requirements.txt
```

### **Step 2: Start Backend** 
```bash
python backend_api.py
```
**Keep this terminal open!** You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### **Step 3: Open Frontend**
Open this file in your browser:
```
PHYSIO-Therapy/index.html
```

**That's it!** 🎉

---

## 📋 What Each File Does

| File | Purpose | When to Run |
|------|---------|-------------|
| `backend_api.py` | **Backend server** - Handles pose detection | **Always run this first!** |
| `index.html` | Landing page | Open in browser |
| `exercise.html` | Exercise selection | Navigate from index |
| `live.html` | **Live camera + squat detection** | Click "Start Exercise" on squats |
| `train_model.py` | Train ML model | Only if you want to retrain |
| `live_inference.py` | Test model with webcam | For testing only |

---

## 🚀 Complete Flow

```
1. Terminal: python backend_api.py
   ↓
2. Browser: Open PHYSIO-Therapy/index.html
   ↓
3. Click: "Sign Up" or "Login"
   ↓
4. Navigate: "Start Exercise"
   ↓
5. Click: "Squats" → "Start Exercise"
   ↓
6. Camera opens → Real-time detection! 🎥
```

---

## 🎬 For Testing Model Only (No Web App)

If you just want to test the model:

```bash
python live_inference.py
```

- Opens webcam
- Shows "Correct" or "Incorrect" squat
- Press 'q' to quit

---

## ⚠️ Common Issues

### "ModuleNotFoundError"
→ Run: `pip install -r requirements.txt`

### "Port 8000 already in use"
→ Close other programs using port 8000, or change port in `backend_api.py`

### "Camera not working"
→ Check browser permissions, use Chrome/Firefox

### "Model not found"
→ Run: `python train_model.py` first

---

## ✅ Quick Checklist

- [ ] Dependencies installed
- [ ] Model exists (`Models/squat_model.pkl`)
- [ ] Backend running (`python backend_api.py`)
- [ ] Browser open (`index.html`)
- [ ] Webcam connected

---

## 🎯 Most Important Files

1. **`backend_api.py`** ← Run this to start server
2. **`PHYSIO-Therapy/index.html`** ← Open this in browser
3. **`Models/squat_model.pkl`** ← Must exist (already trained!)

---

**That's all you need!** Start with `backend_api.py`, then open `index.html` in browser.
