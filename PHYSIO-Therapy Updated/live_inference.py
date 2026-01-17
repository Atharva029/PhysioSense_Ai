import cv2
import mediapipe as mp
import numpy as np
import joblib

# Load trained model
model = joblib.load("Models/squat_model.pkl")

# MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_draw = mp.solutions.drawing_utils

# Webcam
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Convert to RGB
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = pose.process(rgb)

    if result.pose_landmarks:
        landmarks = []

        for lm in result.pose_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

        # Convert to numpy & reshape
        landmarks = np.array(landmarks).reshape(1, -1)

        # Prediction
        prediction = model.predict(landmarks)[0]

        if prediction == 1:
            label = "Correct Squat"
            color = (0, 255, 0)
        else:
            label = "Incorrect Squat"
            color = (0, 0, 255)

        # Draw landmarks
        mp_draw.draw_landmarks(
            frame,
            result.pose_landmarks,
            mp_pose.POSE_CONNECTIONS
        )

        # Display label
        cv2.putText(
            frame,
            label,
            (50, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            color,
            3
        )

    cv2.imshow("PhysioSense AI - Live Squat Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
