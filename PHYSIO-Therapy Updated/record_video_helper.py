"""
Helper script to record videos using your webcam.
This makes it easy to record training videos directly.
"""
import cv2
import os
from datetime import datetime

def record_video(output_folder, label_type="correct"):
    """
    Record a video using webcam.
    
    Args:
        output_folder: Folder to save video
        label_type: "correct" or "incorrect"
    """
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Error: Could not access webcam")
        return
    
    # Set video properties
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    print(f"📹 Camera: {width}x{height} @ {fps} FPS")
    
    # Video writer
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_filename = f"squat_{label_type}_{timestamp}.mp4"
    video_path = os.path.join(output_folder, video_filename)
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))
    
    print("\n" + "=" * 60)
    print("🎬 VIDEO RECORDING")
    print("=" * 60)
    print(f"📁 Saving to: {video_path}")
    print(f"🏷️  Label: {label_type.upper()}")
    print("\n⌨️  Controls:")
    print("   SPACE - Start/Stop recording")
    print("   'q'   - Quit")
    print("\n💡 Tips:")
    print("   - Position person 2-3 meters from camera")
    print("   - Ensure full body is visible")
    print("   - Record 3-5 squats per video")
    print("   - Press SPACE to start recording")
    print("=" * 60)
    
    recording = False
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Add text overlay
        status_text = "RECORDING" if recording else "Ready - Press SPACE"
        color = (0, 0, 255) if recording else (0, 255, 0)
        
        cv2.putText(frame, status_text, (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        cv2.putText(frame, f"Frames: {frame_count}", (10, 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"Label: {label_type.upper()}", (10, 110), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Draw recording indicator
        if recording:
            cv2.circle(frame, (width - 30, 30), 15, (0, 0, 255), -1)
        
        cv2.imshow('Video Recorder - Press SPACE to record, Q to quit', frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord(' '):  # Spacebar
            recording = not recording
            if recording:
                print("🔴 Recording started...")
            else:
                print(f"⏹️  Recording stopped. Saved {frame_count} frames.")
                frame_count = 0
        
        elif key == ord('q'):  # Quit
            break
        
        if recording:
            out.write(frame)
            frame_count += 1
    
    # Cleanup
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    
    if frame_count > 0:
        print(f"\n✅ Video saved: {video_path}")
        print(f"📊 Total frames: {frame_count}")
        print(f"⏱️  Duration: ~{frame_count/fps:.1f} seconds")
    else:
        print("\n⚠️  No frames recorded. Video not saved.")


def main():
    """Main menu for video recording."""
    print("=" * 60)
    print("🎥 SQUAT VIDEO RECORDER")
    print("=" * 60)
    print("\nSelect recording type:")
    print("1. Record CORRECT squat videos")
    print("2. Record INCORRECT squat videos")
    print("3. Exit")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    from paths import DATASET_DIR

    if choice == "1":
        output_folder = str(DATASET_DIR / "Videos" / "Correct")
        record_video(output_folder, "correct")
    elif choice == "2":
        output_folder = str(DATASET_DIR / "Videos" / "Incorrect")
        record_video(output_folder, "incorrect")
    elif choice == "3":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice")


if __name__ == "__main__":
    main()
