"""
Batch script to extract landmarks from multiple videos and add to dataset.
This script processes all videos in the Dataset/Videos folder.
"""
import cv2
import mediapipe as mp
import csv
import os
from pathlib import Path

# MediaPipe Pose setup
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False)

def process_video(video_path, label, csv_writer, video_name=""):
    """
    Process a single video and extract landmarks.
    
    Args:
        video_path: Path to video file
        label: 1 for correct, 0 for incorrect
        csv_writer: CSV writer object
        video_name: Name of video (for progress tracking)
    """
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"❌ Error: Could not open {video_path}")
        return 0
    
    frame_count = 0
    landmarks_extracted = 0
    
    print(f"  Processing: {video_name or os.path.basename(video_path)}...", end=" ")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        
        if results.pose_landmarks:
            row = []
            for lm in results.pose_landmarks.landmark:
                row.extend([lm.x, lm.y, lm.z])
            
            row.append(label)
            csv_writer.writerow(row)
            landmarks_extracted += 1
    
    cap.release()
    print(f"✅ Extracted {landmarks_extracted} landmarks from {frame_count} frames")
    return landmarks_extracted


def process_folder(folder_path, label, csv_writer):
    """
    Process all videos in a folder.
    
    Args:
        folder_path: Path to folder containing videos
        label: 1 for correct, 0 for incorrect
        csv_writer: CSV writer object
    """
    video_extensions = ['.mp4', '.mov', '.avi', '.mkv']
    video_files = []
    
    if not os.path.exists(folder_path):
        print(f"⚠️  Folder not found: {folder_path}")
        return 0
    
    # Find all video files
    for ext in video_extensions:
        video_files.extend(Path(folder_path).glob(f'*{ext}'))
        video_files.extend(Path(folder_path).glob(f'*{ext.upper()}'))
    
    if not video_files:
        print(f"⚠️  No video files found in {folder_path}")
        return 0
    
    print(f"\n📁 Processing {len(video_files)} videos from {folder_path}")
    total_landmarks = 0
    
    for video_path in sorted(video_files):
        landmarks = process_video(str(video_path), label, csv_writer, video_path.name)
        total_landmarks += landmarks
    
    return total_landmarks


def main():
    """Main function to process all videos and create/extend dataset."""
    print("=" * 70)
    print("🎬 BATCH LANDMARK EXTRACTION FROM VIDEOS")
    print("=" * 70)
    
    from paths import DATASET_DIR, SQUAT_DATASET_CSV, SQUAT_DATASET_EXTENDED_CSV, SQUAT_DATASET_COMBINED_CSV
    
    # Create Dataset directory if it doesn't exist
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    videos_dir = DATASET_DIR / "Videos"
    correct_dir = videos_dir / "Correct"
    incorrect_dir = videos_dir / "Incorrect"
    videos_dir.mkdir(exist_ok=True)
    correct_dir.mkdir(exist_ok=True)
    incorrect_dir.mkdir(exist_ok=True)
    
    # Check if existing dataset exists
    existing_dataset = SQUAT_DATASET_CSV
    output_dataset = SQUAT_DATASET_EXTENDED_CSV
    
    # Create CSV header
    header = []
    for i in range(33):
        header += [f"x{i}", f"y{i}", f"z{i}"]
    header.append("label")
    
    total_correct = 0
    total_incorrect = 0
    
    # Process videos
    with open(output_dataset, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        
        # Process correct videos
        print("\n" + "=" * 70)
        print("✅ PROCESSING CORRECT SQUAT VIDEOS")
        print("=" * 70)
        correct_folder = str(correct_dir)
        total_correct = process_folder(correct_folder, 1, writer)
        
        # Process incorrect videos
        print("\n" + "=" * 70)
        print("❌ PROCESSING INCORRECT SQUAT VIDEOS")
        print("=" * 70)
        incorrect_folder = str(incorrect_dir)
        total_incorrect = process_folder(incorrect_folder, 0, writer)
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 EXTRACTION SUMMARY")
    print("=" * 70)
    print(f"✅ Correct samples: {total_correct}")
    print(f"❌ Incorrect samples: {total_incorrect}")
    print(f"📈 Total samples: {total_correct + total_incorrect}")
    print(f"\n💾 Dataset saved to: {output_dataset}")
    
    # Check if we should merge with existing dataset
    if os.path.exists(existing_dataset):
        print("\n" + "=" * 70)
        print("🔄 MERGING WITH EXISTING DATASET")
        print("=" * 70)
        
        import pandas as pd
        
        # Load existing dataset
        existing_df = pd.read_csv(existing_dataset)
        new_df = pd.read_csv(output_dataset)
        
        # Combine datasets
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        
        # Remove duplicates (if any)
        initial_count = len(combined_df)
        combined_df = combined_df.drop_duplicates()
        duplicates_removed = initial_count - len(combined_df)
        
        # Save combined dataset
        combined_output = SQUAT_DATASET_COMBINED_CSV
        combined_df.to_csv(combined_output, index=False)
        
        print(f"✅ Existing samples: {len(existing_df)}")
        print(f"✅ New samples: {len(new_df)}")
        print(f"✅ Combined total: {len(combined_df)}")
        if duplicates_removed > 0:
            print(f"⚠️  Removed {duplicates_removed} duplicate samples")
        print(f"\n💾 Combined dataset saved to: {combined_output}")
        
        # Show distribution
        print("\n📊 Label Distribution:")
        print(combined_df['label'].value_counts())
    
    print("\n" + "=" * 70)
    print("✅ EXTRACTION COMPLETE!")
    print("=" * 70)
    print("\n📝 Next steps:")
    print("   1. Review the extracted dataset")
    print("   2. Train your model with: python train_model.py")
    print("   3. Test the model on new videos")


if __name__ == "__main__":
    main()
