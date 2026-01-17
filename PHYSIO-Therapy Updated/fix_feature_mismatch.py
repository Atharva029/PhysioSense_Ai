"""
Fix feature mismatch: Extract first 99 features (33 landmarks) to match MediaPipe.
"""
import pandas as pd
import os

print("=" * 70)
print("🔧 FIXING FEATURE MISMATCH")
print("=" * 70)

input_file = "Dataset/squat_dataset_from_npy.csv"
output_file = "Dataset/squat_dataset_fixed.csv"

if not os.path.exists(input_file):
    print(f"❌ Error: {input_file} not found!")
    exit(1)

print(f"\n📊 Loading dataset: {input_file}")
df = pd.read_csv(input_file)

print(f"   Original features: {len(df.columns) - 1}")
print(f"   Samples: {len(df):,}")

# Extract first 99 features (33 landmarks × 3 coordinates)
# Features are: x0,y0,z0, x1,y1,z1, ..., x32,y32,z32 (99 total)
feature_cols = [col for col in df.columns if col != 'label']
first_99_features = feature_cols[:99]

print(f"\n✂️  Extracting first 99 features (33 landmarks)...")
print(f"   Features: x0-z0 to x32-z32")

# Create new dataframe with first 99 features + label
df_fixed = df[first_99_features + ['label']].copy()

# Verify
print(f"\n✅ Fixed dataset:")
print(f"   Features: {len(df_fixed.columns) - 1}")
print(f"   Samples: {len(df_fixed):,}")
print(f"   Matches MediaPipe: {len(df_fixed.columns) - 1 == 99}")

# Save
print(f"\n💾 Saving to: {output_file}")
df_fixed.to_csv(output_file, index=False)

print("\n" + "=" * 70)
print("✅ FEATURE MISMATCH FIXED!")
print("=" * 70)
print("\n💡 Next Steps:")
print(f"   1. Train model: python train_model.py")
print(f"      (It will automatically use the fixed dataset)")
print(f"   2. Test: python live_inference.py")
