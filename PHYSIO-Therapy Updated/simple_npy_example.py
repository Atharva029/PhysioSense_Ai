"""
Simple example showing how .npy files are extracted and converted.
Run this to see the process step-by-step.
"""
import numpy as np
import pandas as pd
import os

print("=" * 70)
print("🔍 SIMPLE EXAMPLE: How .npy Files Are Extracted")
print("=" * 70)

# Step 1: Load a single .npy file
print("\n📁 Step 1: Load a single .npy file")
print("-" * 70)

from paths import SQUAT_DATA_DIR

sample_file = str(SQUAT_DATA_DIR / "Valid" / "0" / "0.npy")
if os.path.exists(sample_file):
    data = np.load(sample_file)
    print(f"✅ Loaded: {sample_file}")
    print(f"   Shape: {data.shape}")
    print(f"   Type: {type(data)}")
    print(f"   Data type: {data.dtype}")
    print(f"   First 10 values: {data[:10]}")
    print(f"   Total values: {len(data)}")
else:
    print(f"❌ File not found: {sample_file}")
    print("   (This is just an example - file might not exist)")

# Step 2: Show what the data represents
print("\n📊 Step 2: What the data represents")
print("-" * 70)
print("Each .npy file contains pose landmark coordinates:")
print("  - 132 values = 44 landmarks × 3 coordinates (x, y, z)")
print("  - Format: [x0, y0, z0, x1, y1, z1, ..., x43, y43, z43]")
print("  - Each landmark is a point on the body (nose, shoulder, etc.)")

# Step 3: Show extraction process
print("\n🔄 Step 3: Extraction process (simplified)")
print("-" * 70)

# Simulate loading multiple files
print("1. Find all .npy files in Valid/ and Invalid/ folders")
print("2. For each file:")
print("   - Load: data = np.load('file.npy')")
print("   - Flatten: data = data.flatten()  # if needed")
print("   - Store: all_data.append(data)")
print("   - Label: labels.append(1)  # for Valid, 0 for Invalid")
print("3. Convert to array: data_array = np.array(all_data)")
print("4. Create DataFrame: df = pd.DataFrame(data_array)")
print("5. Add labels: df['label'] = labels")
print("6. Save: df.to_csv('output.csv')")

# Step 4: Show the result structure
print("\n📋 Step 4: Result structure")
print("-" * 70)
print("CSV file structure:")
print("  Columns: x0, y0, z0, x1, y1, z1, ..., x43, y43, z43, label")
print("  Rows: Each row = one .npy file = one sample")
print("  Label: 1 = Valid (correct), 0 = Invalid (incorrect)")

# Step 5: Show actual numbers from your dataset
print("\n📈 Step 5: Your dataset statistics")
print("-" * 70)

from paths import SQUAT_DATA_DIR

valid_folder = str(SQUAT_DATA_DIR / "Valid")
invalid_folder = str(SQUAT_DATA_DIR / "Invalid")

if os.path.exists(valid_folder):
    valid_count = sum(len(files) for _, _, files in os.walk(valid_folder))
    print(f"✅ Valid samples: {valid_count:,}")
else:
    print("⚠️  Valid folder not found")

if os.path.exists(invalid_folder):
    invalid_count = sum(len(files) for _, _, files in os.walk(invalid_folder))
    print(f"❌ Invalid samples: {invalid_count:,}")
else:
    print("⚠️  Invalid folder not found")

if os.path.exists(valid_folder) and os.path.exists(invalid_folder):
    total = valid_count + invalid_count
    print(f"📊 Total samples: {total:,}")
    print(f"   Valid: {valid_count/total*100:.1f}%")
    print(f"   Invalid: {invalid_count/total*100:.1f}%")

print("\n" + "=" * 70)
print("✅ That's how .npy files are extracted!")
print("=" * 70)
print("\n💡 The complete script is in: convert_squat_data_to_csv.py")
print("   Run it with: python convert_squat_data_to_csv.py")
