# 🛠️ Setup Instructions

## Step 1: Install Python Dependencies

Install all required packages:

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install opencv-python mediapipe pandas scikit-learn numpy joblib
```

---

## Step 2: Create Folder Structure

The scripts will create folders automatically, but you can also create them manually:

```
Dataset/
├── Videos/
│   ├── Correct/
│   └── Incorrect/
Models/
```

---

## Step 3: Verify Installation

Test that everything works:

```bash
python -c "import cv2, mediapipe, pandas, sklearn; print('✅ All dependencies installed!')"
```

---

## Step 4: Start Collecting Data!

Follow the `QUICK_START.md` guide to begin collecting training data.
