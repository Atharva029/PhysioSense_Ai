"""
Script to check the quality and diversity of your collected dataset.
Run this after collecting new videos to see if you need more data.
"""
import pandas as pd
import numpy as np
import os
from pathlib import Path

def analyze_dataset(csv_path):
    """Analyze dataset quality and diversity."""
    if not os.path.exists(csv_path):
        print(f"❌ Dataset not found: {csv_path}")
        return
    
    df = pd.read_csv(csv_path)
    
    print("=" * 70)
    print("📊 DATASET QUALITY ANALYSIS")
    print("=" * 70)
    
    # Basic statistics
    print(f"\n📈 Basic Statistics:")
    print(f"   Total samples: {len(df)}")
    print(f"   Features: {len(df.columns) - 1} (33 landmarks × 3 coordinates)")
    
    # Label distribution
    print(f"\n🏷️  Label Distribution:")
    label_counts = df['label'].value_counts()
    print(f"   Correct (1): {label_counts.get(1, 0)} ({label_counts.get(1, 0)/len(df)*100:.1f}%)")
    print(f"   Incorrect (0): {label_counts.get(0, 0)} ({label_counts.get(0, 0)/len(df)*100:.1f}%)")
    
    # Check balance
    balance_ratio = min(label_counts) / max(label_counts) if len(label_counts) > 1 else 0
    if balance_ratio > 0.8:
        print("   ✅ Well balanced")
    elif balance_ratio > 0.6:
        print("   ⚠️  Moderately balanced")
    else:
        print("   ❌ Imbalanced - collect more samples of minority class")
    
    # Feature statistics
    print(f"\n📐 Feature Statistics:")
    feature_cols = [col for col in df.columns if col != 'label']
    
    # Check for missing values
    missing = df[feature_cols].isnull().sum().sum()
    if missing == 0:
        print("   ✅ No missing values")
    else:
        print(f"   ⚠️  {missing} missing values found")
    
    # Check for outliers (values outside 0-1 range for normalized coordinates)
    outliers = ((df[feature_cols] < -2) | (df[feature_cols] > 2)).sum().sum()
    if outliers == 0:
        print("   ✅ No extreme outliers")
    else:
        print(f"   ⚠️  {outliers} potential outliers (values outside normal range)")
    
    # Diversity check (variance in features)
    print(f"\n🎲 Diversity Analysis:")
    variances = df[feature_cols].var()
    low_variance_features = (variances < 0.001).sum()
    
    if low_variance_features < len(feature_cols) * 0.1:
        print(f"   ✅ Good diversity ({low_variance_features}/{len(feature_cols)} low-variance features)")
    else:
        print(f"   ⚠️  Low diversity ({low_variance_features}/{len(feature_cols)} low-variance features)")
        print("      Consider collecting videos with more variation")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    
    if len(df) < 1000:
        print("   📹 Collect more videos (aim for 5,000+ samples)")
    
    if balance_ratio < 0.7:
        minority_label = label_counts.idxmin()
        minority_count = label_counts.min()
        print(f"   ⚖️  Collect more '{'correct' if minority_label == 1 else 'incorrect'}' samples")
        print(f"      Current: {minority_count} samples")
    
    if low_variance_features > len(feature_cols) * 0.2:
        print("   🎬 Record videos with:")
        print("      - Different people")
        print("      - Different camera angles")
        print("      - Different lighting conditions")
    
    # Check video sources
    print(f"\n📁 Video Sources:")
    video_folders = {
        "Correct": "Dataset/Videos/Correct",
        "Incorrect": "Dataset/Videos/Incorrect"
    }
    
    total_videos = 0
    for label_name, folder in video_folders.items():
        if os.path.exists(folder):
            video_files = list(Path(folder).glob("*.mp4")) + \
                         list(Path(folder).glob("*.mov")) + \
                         list(Path(folder).glob("*.avi"))
            total_videos += len(video_files)
            print(f"   {label_name}: {len(video_files)} videos")
        else:
            print(f"   {label_name}: Folder not found")
    
    print(f"\n   Total videos: {total_videos}")
    
    if total_videos < 10:
        print("   ⚠️  Consider collecting more videos (aim for 10-20)")
    
    # Sample size recommendations
    print(f"\n🎯 Sample Size Recommendations:")
    print(f"   Current: {len(df)} samples")
    print(f"   Minimum for basic model: 1,000 samples")
    print(f"   Recommended: 5,000-10,000 samples")
    print(f"   Ideal: 10,000+ samples")
    
    samples_needed = max(0, 5000 - len(df))
    if samples_needed > 0:
        print(f"\n   📊 Need {samples_needed} more samples to reach recommended minimum")
    
    print("\n" + "=" * 70)


def main():
    """Main function."""
    from paths import (
        SQUAT_DATASET_CSV,
        SQUAT_DATASET_EXTENDED_CSV,
        SQUAT_DATASET_COMBINED_CSV,
        DATASET_DIR,
    )

    datasets = [
        SQUAT_DATASET_CSV,
        SQUAT_DATASET_EXTENDED_CSV,
        SQUAT_DATASET_COMBINED_CSV,
    ]
    
    print("🔍 Checking available datasets...\n")
    
    found_datasets = [str(d) for d in datasets if d.exists()]
    
    if not found_datasets:
        print("❌ No datasets found!")
        print("\nAvailable files:")
        if DATASET_DIR.exists():
            for file in sorted(p.name for p in DATASET_DIR.iterdir()):
                print(f"   - {file}")
        return
    
    if len(found_datasets) == 1:
        analyze_dataset(found_datasets[0])
    else:
        print("Multiple datasets found. Select one to analyze:")
        for i, dataset in enumerate(found_datasets, 1):
            print(f"   {i}. {dataset}")
        
        choice = input("\nEnter number (1-{}): ".format(len(found_datasets))).strip()
        
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(found_datasets):
                analyze_dataset(found_datasets[idx])
            else:
                print("❌ Invalid choice")
        except ValueError:
            print("❌ Invalid input")


if __name__ == "__main__":
    main()
