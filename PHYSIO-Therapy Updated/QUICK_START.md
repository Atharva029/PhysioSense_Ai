# 🚀 Quick Start Guide - Data Collection Workflow

## 📋 Complete Workflow

### Step 1: Record Videos 📹

**Option A: Use the video recorder script (recommended)**
```bash
python record_video_helper.py
```

**Option B: Record manually**
- Use your phone/camera to record videos
- Save them in:
  - `Dataset/Videos/Correct/` for correct squats
  - `Dataset/Videos/Incorrect/` for incorrect squats

**Tips:**
- Record 10-20 videos total (5-10 correct, 5-10 incorrect)
- Each video should be 10-30 seconds (3-5 squats)
- Vary: different people, angles, lighting

---

### Step 2: Extract Landmarks 🎯

After recording videos, extract landmarks:

```bash
python extract_landmarks_batch.py
```

This will:
- ✅ Process all videos in `Dataset/Videos/Correct/`
- ✅ Process all videos in `Dataset/Videos/Incorrect/`
- ✅ Extract pose landmarks from each frame
- ✅ Create `squat_dataset_extended.csv`
- ✅ Merge with existing dataset (if exists)

---

### Step 3: Check Data Quality 📊

Check if you have enough diverse data:

```bash
python check_data_quality.py
```

This shows:
- Total samples
- Label distribution
- Data diversity
- Recommendations for improvement

---

### Step 4: Train Model 🤖

Train your model with the new data:

```bash
python train_model.py
```

This will:
- ✅ Load the best available dataset
- ✅ Train Random Forest model
- ✅ Evaluate performance
- ✅ Save model to `Models/squat_model.pkl`

---

### Step 5: Test Model 🧪

Test your model on new videos (not in training set):

```bash
python live_inference.py
```

Or use your web app - the model will automatically use the new trained model!

---

## 📁 Folder Structure

After setup, your folder should look like:

```
PHYSIO-Therapy Updated/
├── Dataset/
│   ├── Videos/
│   │   ├── Correct/
│   │   │   ├── squat_correct_person1_front.mp4
│   │   │   ├── squat_correct_person2_side.mp4
│   │   │   └── ...
│   │   └── Incorrect/
│   │       ├── squat_incorrect_person1_knees_in.mp4
│   │       └── ...
│   ├── squat_dataset.csv (original)
│   ├── squat_dataset_extended.csv (new videos)
│   └── squat_dataset_combined.csv (all combined)
├── Models/
│   └── squat_model.pkl (trained model)
├── record_video_helper.py
├── extract_landmarks_batch.py
├── check_data_quality.py
└── train_model.py
```

---

## 🎯 Recommended Collection Plan

### Week 1: Initial Collection
- [ ] Record 5 correct videos (different people/angles)
- [ ] Record 5 incorrect videos (different mistakes)
- [ ] Extract landmarks
- [ ] Train model
- [ ] Test on new person

### Week 2: Expansion
- [ ] Record 5 more correct videos
- [ ] Record 5 more incorrect videos
- [ ] Extract and merge
- [ ] Retrain model
- [ ] Evaluate improvement

### Week 3: Refinement
- [ ] Fill gaps (if model struggles with certain cases)
- [ ] Add edge cases
- [ ] Final training
- [ ] Production testing

---

## 💡 Pro Tips

1. **Start Small**: Record 2-3 videos first, test the pipeline
2. **Iterate**: Test model after each batch of videos
3. **Document**: Note what works/doesn't work
4. **Diversity**: Different people = better model
5. **Quality**: Better to have fewer high-quality videos than many poor ones

---

## 🆘 Troubleshooting

**Problem**: "No videos found"
- ✅ Check folder structure: `Dataset/Videos/Correct/` and `Dataset/Videos/Incorrect/`
- ✅ Ensure video files are `.mp4`, `.mov`, or `.avi`

**Problem**: "Model accuracy is low"
- ✅ Collect more diverse videos
- ✅ Check data quality: `python check_data_quality.py`
- ✅ Ensure balanced dataset (50% correct, 50% incorrect)

**Problem**: "Model works on training videos but not new ones"
- ✅ This is overfitting - collect more diverse videos
- ✅ Test with different people/angles/lighting

---

## 📞 Next Steps

1. **Start Recording**: `python record_video_helper.py`
2. **Extract Data**: `python extract_landmarks_batch.py`
3. **Check Quality**: `python check_data_quality.py`
4. **Train Model**: `python train_model.py`
5. **Test**: Use your web app or `python live_inference.py`

Good luck! 🎉
