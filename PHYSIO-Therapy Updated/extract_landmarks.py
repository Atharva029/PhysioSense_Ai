import cv2
import mediapipe as mp
import csv
import os

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False)

def process_video(video_path, label, csv_writer):
    cap = cv2.VideoCapture(video_path)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)

        if results.pose_landmarks:
            row = []
            for lm in results.pose_landmarks.landmark:
                row.extend([lm.x, lm.y, lm.z])  # ✅ FIXED

            row.append(label)
            csv_writer.writerow(row)

    cap.release()


from paths import DATASET_DIR

DATASET_DIR.mkdir(parents=True, exist_ok=True)

with open((DATASET_DIR / "squat_dataset.csv"), "w", newline="") as f:
    writer = csv.writer(f)

    header = []
    for i in range(33):
        header += [f"x{i}", f"y{i}", f"z{i}"]  # ✅ FIXED
    header.append("label")

    writer.writerow(header)

    process_video(str(DATASET_DIR / "squat_correct.mp4"), 1, writer)
    process_video(str(DATASET_DIR / "squat_incorrect.mp4"), 0, writer)

print("Dataset created successfully!")
