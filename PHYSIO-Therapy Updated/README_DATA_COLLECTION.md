# 📚 Complete Data Collection Guide

## 🎯 Overview

This guide will help you collect diverse training data to improve your squat detection model from **855 samples (2 videos)** to **5,000-10,000+ samples (10-20 videos)**.

---

## 📦 What You Have Now

✅ **Scripts Created:**
1. `record_video_helper.py` - Record videos using webcam
2. `extract_landmarks_batch.py` - Extract landmarks from all videos
3. `check_data_quality.py` - Analyze dataset quality
4. `train_model.py` - Train model with new data

✅ **Guides:**
- `DATA_COLLECTION_GUIDE.md` - Detailed collection guide
- `QUICK_START.md` - Quick workflow reference
- `SETUP_INSTRUCTIONS.md` - Setup steps

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Record Videos
```bash
python record_video_helper.py
```
- Record 5-10 correct squat videos
- Record 5-10 incorrect squat videos
- Save in `Dataset/Videos/Correct/` and `Dataset/Videos/Incorrect/`

### 2️⃣ Extract Landmarks
```bash
python extract_landmarks_batch.py
```
- Processes all videos automatically
- Creates `squat_dataset_extended.csv`
- Merges with existing dataset

### 3️⃣ Train Model
```bash
python train_model.py
```
- Trains Random Forest model
- Saves to `Models/squat_model.pkl`
- Shows accuracy and metrics

---

## 📋 Detailed Workflow

### Phase 1: Setup (One-time)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Verify installation:**
   ```bash
   python -c "import cv2, mediapipe, pandas, sklearn; print('✅ Ready!')"
   ```

### Phase 2: Record Videos

**Using the helper script:**
```bash
python record_video_helper.py
```

**Or record manually:**
- Use phone/camera
- Save videos in correct folders
- Name them clearly: `squat_correct_person1_front.mp4`

**What to record:**
- ✅ **Correct squats:** 5-10 videos
  - Different people
  - Different camera angles (front, side, 45°)
  - Different lighting
  - 3-5 reps per video

- ❌ **Incorrect squats:** 5-10 videos
  - Knees collapsing inward
  - Back rounding
  - Not deep enough
  - Different people making mistakes

### Phase 3: Process Videos

```bash
python extract_landmarks_batch.py
```

**What it does:**
- Scans `Dataset/Videos/Correct/` folder
- Scans `Dataset/Videos/Incorrect/` folder
- Extracts landmarks from each frame
- Creates CSV with all samples
- Merges with existing dataset

**Output:**
- `squat_dataset_extended.csv` - New videos only
- `squat_dataset_combined.csv` - All videos combined

### Phase 4: Check Quality

```bash
python check_data_quality.py
```

**What it shows:**
- Total samples
- Label distribution (should be ~50/50)
- Data diversity
- Recommendations

**Target metrics:**
- ✅ 5,000+ total samples
- ✅ Balanced labels (50% correct, 50% incorrect)
- ✅ Good diversity (different people/angles)

### Phase 5: Train Model

```bash
python train_model.py
```

**What it does:**
- Loads best available dataset
- Splits into train/test (80/20)
- Trains Random Forest
- Evaluates performance
- Saves model

**Expected results:**
- Training accuracy: 95%+
- Test accuracy: 85%+
- Good generalization

### Phase 6: Test Model

**Option 1: Use web app**
- Start backend: `python backend_api.py` or `uvicorn backend_api:app --reload`
- Open `live.html` in browser
- Test with new person

**Option 2: Command line**
```bash
python live_inference.py
```

---

## 📊 Progress Tracking

Track your collection progress:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total Videos | 2 | 10-20 | ⚠️ |
| Total Samples | 855 | 5,000+ | ⚠️ |
| Correct Videos | 1 | 5-10 | ⚠️ |
| Incorrect Videos | 1 | 5-10 | ⚠️ |
| Different People | 1 | 3-5 | ⚠️ |
| Different Angles | 1 | 3-5 | ⚠️ |

---

## 🎬 Recording Tips

### ✅ DO:
- Record in good lighting
- Keep camera stable (use tripod)
- Show full body (head to feet)
- Record 3-5 reps per video
- Vary conditions (people, angles, lighting)
- Keep videos 10-30 seconds

### ❌ DON'T:
- Record in dark conditions
- Cut off body parts
- Use shaky camera
- Record only 1 rep
- Use same person for all videos
- Record too close or too far

---

## 🔍 Troubleshooting

### Problem: "No module named cv2"
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Problem: "No videos found"
**Solution:** Check folder structure
- `Dataset/Videos/Correct/` should contain `.mp4` files
- `Dataset/Videos/Incorrect/` should contain `.mp4` files

### Problem: "Low model accuracy"
**Solution:** 
- Collect more diverse videos
- Check data quality: `python check_data_quality.py`
- Ensure balanced dataset

### Problem: "Model overfits"
**Solution:**
- Collect videos from different people
- Vary camera angles and lighting
- Test on completely new videos

---

## 📈 Expected Improvements

After collecting more data:

| Metric | Before | After (Target) |
|--------|--------|---------------|
| Training Samples | 855 | 5,000+ |
| Videos | 2 | 10-20 |
| Test Accuracy | 98%* | 85-90%** |
| Generalization | Poor | Good |
| Different People | ❌ | ✅ |

*High accuracy is misleading - model memorized 2 videos
**Lower but more reliable - works on new people

---

## 🎯 Next Steps

1. **Read:** `DATA_COLLECTION_GUIDE.md` for detailed tips
2. **Record:** Start with 2-3 videos to test the pipeline
3. **Extract:** Run `extract_landmarks_batch.py`
4. **Check:** Run `check_data_quality.py`
5. **Train:** Run `train_model.py`
6. **Test:** Try model on new person
7. **Iterate:** Collect more videos based on results

---

## 📞 Need Help?

- Check `QUICK_START.md` for quick reference
- Check `DATA_COLLECTION_GUIDE.md` for detailed guide
- Review error messages - they usually tell you what's wrong

---

## ✅ Checklist

Before starting:
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Folders created (`Dataset/Videos/Correct/` and `Dataset/Videos/Incorrect/`)
- [ ] Camera/webcam working

During collection:
- [ ] Recorded 5-10 correct videos
- [ ] Recorded 5-10 incorrect videos
- [ ] Videos saved in correct folders
- [ ] Extracted landmarks from all videos
- [ ] Checked data quality
- [ ] Trained model
- [ ] Tested on new person

---

Good luck with your data collection! 🎉
