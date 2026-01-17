# 📹 Data Collection Guide for Squat Detection Model

## 🎯 Goal
Collect diverse training data to improve model accuracy and generalization.

## 📊 Current Status
- **Current dataset**: 855 samples from 2 videos
- **Target**: 5,000-10,000+ samples from 10-20 videos
- **Distribution**: ~50% correct, ~50% incorrect

---

## 📋 Step-by-Step Data Collection Process

### Phase 1: Planning Your Data Collection

#### 1.1 What to Record

**Correct Squats (5-10 videos):**
- ✅ Different people (various heights, body types)
- ✅ Different camera angles (front, side, 45-degree)
- ✅ Different lighting conditions (bright, dim, natural)
- ✅ Different backgrounds
- ✅ Different clothing (tight, loose)
- ✅ Full range of motion (standing → squat → standing)

**Incorrect Squats (5-10 videos):**
- ❌ Knees collapsing inward
- ❌ Back rounding/leaning too far forward
- ❌ Knees going past toes
- ❌ Not going deep enough
- ❌ Heels lifting off ground
- ❌ Uneven weight distribution
- ❌ Different people making mistakes

#### 1.2 Video Requirements

**Technical Specifications:**
- **Resolution**: 720p minimum (1280x720), 1080p preferred
- **Frame Rate**: 30 FPS minimum
- **Duration**: 10-30 seconds per video (shows multiple reps)
- **Format**: MP4, MOV, or AVI
- **Camera Position**: 
  - Full body visible
  - Person centered in frame
  - 2-3 meters distance from camera

**Content Requirements:**
- Person should be fully visible (head to feet)
- Good lighting (avoid shadows on body)
- Clear background (avoid busy backgrounds)
- Multiple reps per video (3-5 squats)
- Smooth, continuous movement

---

### Phase 2: Recording Videos

#### 2.1 Setup Checklist

```
□ Camera/phone positioned 2-3 meters away
□ Full body visible in frame
□ Good lighting (natural or bright)
□ Clear background
□ Camera is stable (use tripod if possible)
□ Person is centered
□ Recording in landscape mode
```

#### 2.2 Recording Process

**For Each Video:**
1. **Label the video** before recording:
   - `squat_correct_person1_angle1.mp4`
   - `squat_incorrect_person2_knees_inward.mp4`

2. **Record multiple reps** (3-5 squats per video)

3. **Keep it natural** - don't pause between reps

4. **Vary the conditions:**
   - Different people
   - Different angles
   - Different lighting

#### 2.3 Video Naming Convention

```
squat_[correct/incorrect]_[person_id]_[angle]_[variation].mp4

Examples:
- squat_correct_person1_front.mp4
- squat_correct_person2_side.mp4
- squat_incorrect_person1_knees_in.mp4
- squat_incorrect_person2_back_round.mp4
- squat_correct_person3_angle45.mp4
```

---

### Phase 3: Organizing Your Videos

#### 3.1 Folder Structure

```
Dataset/
├── Videos/
│   ├── Correct/
│   │   ├── squat_correct_person1_front.mp4
│   │   ├── squat_correct_person1_side.mp4
│   │   ├── squat_correct_person2_front.mp4
│   │   └── ...
│   └── Incorrect/
│       ├── squat_incorrect_person1_knees_in.mp4
│       ├── squat_incorrect_person2_back_round.mp4
│       └── ...
├── squat_dataset.csv (existing)
└── squat_dataset_extended.csv (new combined dataset)
```

---

### Phase 4: Processing Videos

Use the provided scripts to extract landmarks from your videos.

---

## 🎬 Recording Tips

### ✅ DO:
- Record in good lighting
- Keep camera stable
- Show full body
- Record multiple reps per video
- Vary conditions (people, angles, lighting)
- Keep videos 10-30 seconds long

### ❌ DON'T:
- Record in very dark conditions
- Have person too close or too far
- Cut off body parts (head, feet)
- Use shaky camera
- Record only 1 rep per video
- Use same person/angle for all videos

---

## 📈 Progress Tracking

Track your data collection progress:

- [ ] Correct videos: ___ / 10
- [ ] Incorrect videos: ___ / 10
- [ ] Total samples extracted: ___
- [ ] Different people: ___
- [ ] Different angles: ___
- [ ] Different lighting: ___

---

## 🔄 Next Steps After Collection

1. Extract landmarks from all videos
2. Combine with existing dataset
3. Retrain model
4. Test on new videos (not in training set)
5. Evaluate performance

---

## 📝 Notes

- **Quality > Quantity**: Better to have fewer high-quality videos than many poor ones
- **Diversity is key**: Different people, angles, and conditions improve generalization
- **Balance**: Try to keep ~50% correct, ~50% incorrect
- **Test regularly**: Test model on new videos as you collect them
