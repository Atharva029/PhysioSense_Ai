"""
Convert Squat_Data .npy files to CSV format compatible with training pipeline.
"""
import numpy as np
import pandas as pd
import os
from pathlib import Path
try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    def tqdm(iterable, desc=""):
        if desc:
            print(f"Processing {desc}...")
        return iterable

def convert_npy_to_csv():
    """Convert all .npy files in Squat_Data to CSV format."""
    print("=" * 70)
    print("🔄 CONVERTING SQUAT_DATA TO CSV FORMAT")
    print("=" * 70)
    
    from paths import SQUAT_DATA_DIR, DATASET_DIR, SQUAT_DATASET_FROM_NPY_CSV
    
    valid_folder = SQUAT_DATA_DIR / "Valid"
    invalid_folder = SQUAT_DATA_DIR / "Invalid"
    
    all_data = []
    labels = []
    
    # Process valid samples
    print("\n✅ Processing Valid samples...")
    if valid_folder.exists():
        valid_files = []
        for subfolder in os.listdir(valid_folder):
            subfolder_path = os.path.join(valid_folder, subfolder)
            if os.path.isdir(subfolder_path):
                npy_files = list(Path(subfolder_path).glob("*.npy"))
                valid_files.extend(npy_files)
        
        for npy_file in tqdm(valid_files, desc="Loading valid samples"):
            try:
                data = np.load(str(npy_file))
                # Flatten if needed
                if data.ndim > 1:
                    data = data.flatten()
                all_data.append(data)
                labels.append(1)  # Valid = 1 (correct)
            except Exception as e:
                print(f"\n⚠️  Error loading {npy_file}: {e}")
    
    # Process invalid samples
    print("\n❌ Processing Invalid samples...")
    if invalid_folder.exists():
        invalid_files = []
        for subfolder in os.listdir(invalid_folder):
            subfolder_path = os.path.join(invalid_folder, subfolder)
            if os.path.isdir(subfolder_path):
                npy_files = list(Path(subfolder_path).glob("*.npy"))
                invalid_files.extend(npy_files)
        
        for npy_file in tqdm(invalid_files, desc="Loading invalid samples"):
            try:
                data = np.load(str(npy_file))
                # Flatten if needed
                if data.ndim > 1:
                    data = data.flatten()
                all_data.append(data)
                labels.append(0)  # Invalid = 0 (incorrect)
            except Exception as e:
                print(f"\n⚠️  Error loading {npy_file}: {e}")
    
    if not all_data:
        print("❌ No data found! Check folder structure.")
        return
    
    # Convert to numpy array
    print("\n🔄 Converting to DataFrame...")
    data_array = np.array(all_data)
    
    # Check feature count
    num_features = data_array.shape[1]
    print(f"   Features per sample: {num_features}")
    
    # Create column names
    if num_features == 99:
        # Standard MediaPipe format: 33 landmarks × 3 coordinates
        columns = []
        for i in range(33):
            columns.extend([f'x{i}', f'y{i}', f'z{i}'])
    elif num_features == 132:
        # Extended format: 44 landmarks × 3 coordinates
        columns = []
        for i in range(44):
            columns.extend([f'x{i}', f'y{i}', f'z{i}'])
    else:
        # Generic naming
        columns = [f'feature_{i}' for i in range(num_features)]
        print(f"   ⚠️  Using generic column names (unexpected feature count)")
    
    # Create DataFrame
    df = pd.DataFrame(data_array, columns=columns)
    df['label'] = labels
    
    # Save to CSV
    output_file = SQUAT_DATASET_FROM_NPY_CSV
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"\n💾 Saving to {output_file}...")
    df.to_csv(output_file, index=False)
    
    # Statistics
    print("\n" + "=" * 70)
    print("📊 CONVERSION SUMMARY")
    print("=" * 70)
    print(f"✅ Total samples: {len(df):,}")
    print(f"✅ Valid (label=1): {len(df[df['label']==1]):,}")
    print(f"✅ Invalid (label=0): {len(df[df['label']==0]):,}")
    print(f"✅ Features: {num_features}")
    print(f"✅ Output file: {output_file}")
    
    # Check balance
    valid_pct = len(df[df['label']==1]) / len(df) * 100
    invalid_pct = len(df[df['label']==0]) / len(df) * 100
    print(f"\n⚖️  Distribution:")
    print(f"   Valid: {valid_pct:.1f}%")
    print(f"   Invalid: {invalid_pct:.1f}%")
    
    print("\n" + "=" * 70)
    print("✅ CONVERSION COMPLETE!")
    print("=" * 70)
    print("\n💡 Next Steps:")
    print(f"   1. Update train_model.py to use: {output_file}")
    print(f"   2. Or run: python train_model.py")
    print(f"      (It will automatically detect the new dataset)")


if __name__ == "__main__":
    convert_npy_to_csv()
