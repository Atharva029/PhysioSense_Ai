# 🔍 How .npy Data Extraction Works

## Overview

The `.npy` files in your `Squat_Data` folder are **NumPy array files** that contain pose landmark data. Here's how I extracted and converted them to CSV format.

---

## 📁 Your Data Structure

```
Squat_Data/
├── Valid/          (Correct squats)
│   ├── 0/
│   │   ├── 0.npy
│   │   ├── 1.npy
│   │   └── ...
│   ├── 1/
│   │   ├── 0.npy
│   │   └── ...
│   └── ... (120 subfolders)
└── Invalid/        (Incorrect squats)
    ├── 0/
    │   ├── 0.npy
    │   └── ...
    └── ... (120 subfolders)
```

Each `.npy` file contains:
- **132 features** (44 landmarks × 3 coordinates: x, y, z)
- **Pose landmark data** from MediaPipe or similar pose detection
- **Single frame** of a squat exercise

---

## 🔄 Extraction Process (Step-by-Step)

### Step 1: Load .npy Files

```python
import numpy as np

# Load a single .npy file
data = np.load("Squat_Data/Valid/0/0.npy")

# Result: numpy array with shape (132,)
# Contains: [x0, y0, z0, x1, y1, z1, ..., x43, y43, z43]
```

**What happens:**
- `np.load()` reads the binary NumPy file
- Returns a numpy array
- Shape: `(132,)` - a 1D array with 132 values

---

### Step 2: Find All .npy Files

```python
from pathlib import Path

# Find all .npy files in Valid folder
valid_files = []
for subfolder in os.listdir("Squat_Data/Valid"):
    subfolder_path = os.path.join("Squat_Data/Valid", subfolder)
    if os.path.isdir(subfolder_path):
        npy_files = list(Path(subfolder_path).glob("*.npy"))
        valid_files.extend(npy_files)

# Result: List of all .npy file paths
# Example: ['Squat_Data/Valid/0/0.npy', 'Squat_Data/Valid/0/1.npy', ...]
```

**What happens:**
- Scans all subfolders in `Valid/` and `Invalid/`
- Finds all `.npy` files
- Collects file paths into a list

---

### Step 3: Load and Process Each File

```python
all_data = []
labels = []

# Process Valid samples
for npy_file in valid_files:
    data = np.load(str(npy_file))  # Load .npy file
    
    # Flatten if needed (in case it's 2D)
    if data.ndim > 1:
        data = data.flatten()
    
    all_data.append(data)  # Add to list
    labels.append(1)        # Label: 1 = Valid (correct)

# Process Invalid samples (same process, label = 0)
for npy_file in invalid_files:
    data = np.load(str(npy_file))
    if data.ndim > 1:
        data = data.flatten()
    all_data.append(data)
    labels.append(0)  # Label: 0 = Invalid (incorrect)
```

**What happens:**
- Loads each `.npy` file
- Converts to 1D array (flattens if needed)
- Stores data in `all_data` list
- Stores corresponding label (1 or 0) in `labels` list

---

### Step 4: Convert to NumPy Array

```python
# Convert list of arrays to single 2D array
data_array = np.array(all_data)

# Result shape: (21451, 132)
# - 21,451 rows (samples)
# - 132 columns (features)
```

**What happens:**
- Combines all individual arrays into one 2D array
- Each row = one sample (one .npy file)
- Each column = one feature (x0, y0, z0, x1, y1, z1, ...)

---

### Step 5: Create Column Names

```python
# Create meaningful column names
columns = []
for i in range(44):  # 44 landmarks
    columns.extend([f'x{i}', f'y{i}', f'z{i}'])

# Result: ['x0', 'y0', 'z0', 'x1', 'y1', 'z1', ..., 'x43', 'y43', 'z43']
```

**What happens:**
- Creates column names matching the feature structure
- Format: `x0, y0, z0, x1, y1, z1, ...`
- Makes the data readable and understandable

---

### Step 6: Create DataFrame

```python
import pandas as pd

# Create pandas DataFrame
df = pd.DataFrame(data_array, columns=columns)
df['label'] = labels  # Add label column

# Result: DataFrame with 21,451 rows and 133 columns
# - 132 feature columns (x0-z43)
# - 1 label column (0 or 1)
```

**What happens:**
- Converts NumPy array to pandas DataFrame
- Adds column names
- Adds label column (0 = incorrect, 1 = correct)

---

### Step 7: Save to CSV

```python
# Save DataFrame to CSV file
df.to_csv("Dataset/squat_dataset_from_npy.csv", index=False)

# Result: CSV file with all data
```

**What happens:**
- Writes DataFrame to CSV file
- Each row = one sample
- Each column = one feature or label
- Ready for machine learning training

---

## 📊 Complete Flow Diagram

```
.npy Files (Binary NumPy Arrays)
    ↓
[Step 1] Load each .npy file → numpy array (132 values)
    ↓
[Step 2] Collect all files → List of file paths
    ↓
[Step 3] Load all files → List of numpy arrays
    ↓
[Step 4] Convert to 2D array → (21451, 132) numpy array
    ↓
[Step 5] Create column names → ['x0', 'y0', 'z0', ...]
    ↓
[Step 6] Create DataFrame → pandas DataFrame
    ↓
[Step 7] Save to CSV → squat_dataset_from_npy.csv
    ↓
✅ Ready for Training!
```

---

## 🔍 Example: Single File Extraction

Let me show you what happens with one file:

```python
# Load one .npy file
sample = np.load("Squat_Data/Valid/0/0.npy")

# What's inside?
print(sample.shape)      # (132,)
print(sample.dtype)      # float64
print(sample[:10])       # [0.509, 0.222, -0.215, 0.999, 0.525, ...]

# This represents:
# - x0, y0, z0 = first landmark coordinates
# - x1, y1, z1 = second landmark coordinates
# - ... (44 landmarks total)
```

---

## 💡 Key Points

1. **.npy files are binary** - They store NumPy arrays efficiently
2. **Each file = one sample** - One frame of a squat exercise
3. **132 features** - 44 landmarks × 3 coordinates (x, y, z)
4. **Labels from folders** - `Valid/` = 1, `Invalid/` = 0
5. **Conversion is straightforward** - Load → Process → Save

---

## 🛠️ The Script I Used

The complete script is in `convert_squat_data_to_csv.py`. It:
- ✅ Finds all .npy files automatically
- ✅ Loads them into memory
- ✅ Converts to CSV format
- ✅ Handles errors gracefully
- ✅ Shows progress

---

## 📝 Summary

**Extraction Process:**
1. **Find** all .npy files in Valid/ and Invalid/ folders
2. **Load** each file using `np.load()`
3. **Flatten** if needed (convert to 1D array)
4. **Collect** all data into lists
5. **Convert** to NumPy 2D array
6. **Create** pandas DataFrame with column names
7. **Add** labels (1 for Valid, 0 for Invalid)
8. **Save** to CSV file

**Result:**
- ✅ CSV file with 21,451 samples
- ✅ 132 features per sample
- ✅ Labels (0 or 1)
- ✅ Ready for machine learning

---

## 🚀 Try It Yourself

You can test the extraction:

```python
import numpy as np

# Load a sample file
sample = np.load("Squat_Data/Valid/0/0.npy")
print(f"Shape: {sample.shape}")
print(f"First 10 values: {sample[:10]}")
print(f"Total features: {len(sample)}")
```

This shows you exactly what's inside each .npy file!
