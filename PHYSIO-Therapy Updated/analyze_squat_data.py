"""
Analyze the Squat_Data folder and convert to CSV format for training.
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
        return iterable

def analyze_squat_dataset():
    """Analyze the Squat_Data folder structure and content."""
    print("=" * 70)
    print("📊 SQUAT DATASET ANALYSIS")
    print("=" * 70)
    
    # Count samples
    from paths import SQUAT_DATA_DIR
    valid_folder = SQUAT_DATA_DIR / "Valid"
    invalid_folder = SQUAT_DATA_DIR / "Invalid"
    
    valid_samples = []
    invalid_samples = []
    
    # Count valid samples
    if valid_folder.exists():
        for subfolder in os.listdir(valid_folder):
        
            if os.path.isdir(subfolder_path):
                npy_files = list(Path(subfolder_path).glob("*.npy"))
                valid_samples.extend(npy_files)
    
    # Count invalid samples
    if invalid_folder.exists():
        for subfolder in os.listdir(invalid_folder):
            subfolder_path = os.path.join(invalid_folder, subfolder)
            if os.path.isdir(subfolder_path):
                npy_files = list(Path(subfolder_path).glob("*.npy"))
                invalid_samples.extend(npy_files)
    
    print(f"\n📈 Dataset Statistics:")
    print(f"   ✅ Valid samples: {len(valid_samples):,}")
    print(f"   ❌ Invalid samples: {len(invalid_samples):,}")
    print(f"   📊 Total samples: {len(valid_samples) + len(invalid_samples):,}")
    
    # Check balance
    total = len(valid_samples) + len(invalid_samples)
    valid_pct = len(valid_samples) / total * 100
    invalid_pct = len(invalid_samples) / total * 100
    
    print(f"\n⚖️  Label Distribution:")
    print(f"   Valid: {valid_pct:.1f}%")
    print(f"   Invalid: {invalid_pct:.1f}%")
    
    if abs(valid_pct - invalid_pct) < 10:
        print("   ✅ Well balanced!")
    else:
        print("   ⚠️  Slightly imbalanced (but acceptable)")
    
    # Analyze sample structure
    if valid_samples:
        sample_file = str(valid_samples[0])
        sample_data = np.load(sample_file)
        
        print(f"\n🔍 Sample Analysis:")
        print(f"   Shape: {sample_data.shape}")
        print(f"   Dtype: {sample_data.dtype}")
        print(f"   Min value: {sample_data.min():.4f}")
        print(f"   Max value: {sample_data.max():.4f}")
        print(f"   Mean value: {sample_data.mean():.4f}")
        
        # Check if it's flattened
        if sample_data.ndim == 1:
            print(f"   Features: {sample_data.shape[0]}")
            if sample_data.shape[0] == 99:
                print("   ✅ Matches expected format (33 landmarks × 3 coordinates)")
            elif sample_data.shape[0] == 132:
                print("   ℹ️  132 features detected (might be 44 landmarks × 3)")
            else:
                print(f"   ⚠️  Unexpected feature count: {sample_data.shape[0]}")
    
    # Check diversity (number of subfolders = different videos/sessions)
    valid_subfolders = len([d for d in os.listdir(valid_folder) if os.path.isdir(os.path.join(valid_folder, d))]) if valid_folder.exists() else 0
    invalid_subfolders = len([d for d in os.listdir(invalid_folder) if os.path.isdir(os.path.join(invalid_folder, d))]) if invalid_folder.exists() else 0
    
    print(f"\n🎬 Data Diversity:")
    print(f"   Valid videos/sessions: {valid_subfolders}")
    print(f"   Invalid videos/sessions: {invalid_subfolders}")
    print(f"   Total videos/sessions: {valid_subfolders + invalid_subfolders}")
    
    # Overall assessment
    print(f"\n" + "=" * 70)
    print("✅ DATASET ASSESSMENT")
    print("=" * 70)
    
    score = 0
    max_score = 5
    
    # Check 1: Sample size
    total_samples = len(valid_samples) + len(invalid_samples)
    if total_samples >= 10000:
        print("✅ Excellent sample size (10,000+)")
        score += 1
    elif total_samples >= 5000:
        print("✅ Good sample size (5,000+)")
        score += 0.8
    elif total_samples >= 1000:
        print("⚠️  Moderate sample size (1,000+)")
        score += 0.5
    else:
        print("❌ Low sample size")
    
    # Check 2: Balance
    if abs(valid_pct - invalid_pct) < 15:
        print("✅ Well balanced dataset")
        score += 1
    else:
        print("⚠️  Dataset is imbalanced")
        score += 0.5
    
    # Check 3: Diversity
    if (valid_subfolders + invalid_subfolders) >= 50:
        print("✅ High diversity (50+ videos/sessions)")
        score += 1
    elif (valid_subfolders + invalid_subfolders) >= 20:
        print("✅ Good diversity (20+ videos/sessions)")
        score += 0.8
    else:
        print("⚠️  Low diversity")
        score += 0.5
    
    # Check 4: Format
    if valid_samples:
        sample_data = np.load(str(valid_samples[0]))
        if sample_data.ndim == 1 and sample_data.shape[0] >= 99:
            print("✅ Proper format (1D array with features)")
            score += 1
        else:
            print("⚠️  Unexpected format")
            score += 0.5
    
    # Check 5: File structure
    if valid_folder.exists() and invalid_folder.exists():
        print("✅ Well organized folder structure")
        score += 1
    else:
        print("⚠️  Missing folders")
    
    print(f"\n📊 Overall Score: {score}/{max_score} ({score/max_score*100:.0f}%)")
    
    if score >= 4.5:
        print("🎉 EXCELLENT! This dataset is perfect for training!")
    elif score >= 3.5:
        print("✅ GOOD! This dataset is sufficient for training.")
    elif score >= 2.5:
        print("⚠️  MODERATE. Dataset is usable but could be improved.")
    else:
        print("❌ POOR. Consider collecting more data.")
    
    print("\n" + "=" * 70)
    
    return {
        'valid_samples': len(valid_samples),
        'invalid_samples': len(invalid_samples),
        'total_samples': total_samples,
        'valid_subfolders': valid_subfolders,
        'invalid_subfolders': invalid_subfolders,
        'sample_shape': sample_data.shape if valid_samples else None
    }


if __name__ == "__main__":
    stats = analyze_squat_dataset()
    
    print("\n💡 Next Steps:")
    print("   1. Run: python convert_squat_data_to_csv.py")
    print("   2. This will convert .npy files to CSV format")
    print("   3. Then train: python train_model.py")
