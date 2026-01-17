import base64
import io
import os
from typing import List, Optional

import cv2
import joblib
import mediapipe as mp
import numpy as np
import sqlite3
from datetime import datetime, date, timedelta
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials


# ===== Model & MediaPipe Pose setup (loaded once at startup) =====
from pathlib import Path
from paths import DEFAULT_MODEL_PATH

try:
    MODEL_PATH = DEFAULT_MODEL_PATH
    model = joblib.load(str(MODEL_PATH))
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

mp_pose = mp.solutions.pose


def get_pose():
    if not hasattr(get_pose, 'pose_instance'):
        get_pose.pose_instance = mp_pose.Pose(static_image_mode=False)
    return get_pose.pose_instance


# ===== FastAPI app =====

app = FastAPI(title="PhysioSenseAI Backend", version="1.0")

# Allow local frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_firebase_admin() -> bool:
    if firebase_admin._apps:
        return True

    service_account_file = os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE")
    if not service_account_file:
        return False

    cred = credentials.Certificate(service_account_file)
    firebase_admin.initialize_app(cred)
    return True


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not init_firebase_admin():
        raise HTTPException(
            status_code=500,
            detail=(
                "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_FILE "
                "to a Firebase service account JSON file path."
            ),
        )

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization Bearer token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization Bearer token")

    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return str(uid)


DB_PATH = Path(__file__).resolve().parent / "physiosense.db"


def get_db_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_db_conn()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT,
                exerciseType TEXT NOT NULL,
                duration INTEGER NOT NULL,
                correctReps INTEGER NOT NULL,
                incorrectReps INTEGER NOT NULL,
                accuracy INTEGER NOT NULL,
                avgConfidence INTEGER NOT NULL,
                date TEXT NOT NULL
            );
            """
        )

        cols = [r["name"] for r in conn.execute("PRAGMA table_info(sessions);").fetchall()]
        if "userId" not in cols:
            conn.execute("ALTER TABLE sessions ADD COLUMN userId TEXT;")

        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);")
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_exercise ON sessions(exerciseType);"
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);")
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(userId, date);"
        )
        conn.commit()
    finally:
        conn.close()


init_db()


class AnalyzePoseRequest(BaseModel):
    image: str  # base64 image string (data URL or raw base64)
    exercise_type: str


class Keypoint(BaseModel):
    x: float
    y: float
    score: float


class AnalyzePoseResponse(BaseModel):
    status: str  # "correct" / "incorrect"
    confidence: float  # 0–1
    repCompleted: bool
    keypoints: List[Keypoint]
    feedback: str


class SessionCreate(BaseModel):
    exerciseType: str
    duration: int
    correctReps: int
    incorrectReps: int
    accuracy: int
    avgConfidence: int
    date: str


class SessionRecord(SessionCreate):
    id: int


class DashboardStatsResponse(BaseModel):
    totalSessions: int
    avgAccuracy: int
    totalTime: int
    streak: int


class AggregateStatsResponse(BaseModel):
    totalSessions: int
    totalReps: int
    avgAccuracy: int
    totalTime: int


class AdviceResponse(BaseModel):
    summary: str
    tips: List[str]


def parse_iso_datetime(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected ISO string.")


def row_to_session(row: sqlite3.Row) -> SessionRecord:
    return SessionRecord(
        id=int(row["id"]),
        exerciseType=row["exerciseType"],
        duration=int(row["duration"]),
        correctReps=int(row["correctReps"]),
        incorrectReps=int(row["incorrectReps"]),
        accuracy=int(row["accuracy"]),
        avgConfidence=int(row["avgConfidence"]),
        date=row["date"],
    )


def minutes_from_seconds(seconds: int) -> int:
    if seconds <= 0:
        return 0
    return int(round(seconds / 60.0))


def decode_base64_image(data: str) -> np.ndarray:
    """
    Accepts either a raw base64 string or a data URL like:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
    Returns a BGR OpenCV image array.
    """
    if "," in data:
        data = data.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {e}")

    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")
    return img


def run_pose_and_predict(image_bgr: np.ndarray):
    """Run MediaPipe pose, build feature vector, and get model prediction + confidence."""
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    result = get_pose().process(image_rgb)

    if not result.pose_landmarks:
        return None, None, None

    landmarks = []
    for lm in result.pose_landmarks.landmark:
        landmarks.extend([lm.x, lm.y, lm.z])

    features = np.array(landmarks).reshape(1, -1)

    # Prediction (labels are 0 = incorrect, 1 = correct based on your training)
    pred_label = int(model.predict(features)[0])

    confidence = 0.0
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features)[0]
        # proba is [P(label=0), P(label=1)]
        confidence = float(proba[pred_label])
    else:
        confidence = 1.0  # fallback if no proba support

    return result.pose_landmarks, pred_label, confidence


def build_keypoints(landmarks, image_shape) -> List[Keypoint]:
    """Convert MediaPipe landmarks to pixel-space keypoints that frontend can draw."""
    h, w, _ = image_shape
    keypoints: List[Keypoint] = []
    for lm in landmarks.landmark:
        keypoints.append(
            Keypoint(
                x=lm.x * w,
                y=lm.y * h,
                score=float(lm.visibility),
            )
        )
    return keypoints


def generate_feedback(exercise_type: str, status: str) -> str:
    """
    Generate exercise-specific feedback.
    Currently only squats have trained model - others show generic messages.
    """
    if exercise_type == "squats":
        if status == "correct":
            return (
                "Great squat form! Keep your chest up, knees aligned with your toes, "
                "and control the movement as you go down and up."
            )
        else:
            return (
                "Try to improve your squat: keep your back straight, push your hips back "
                "like sitting on a chair, and avoid letting your knees collapse inward."
            )
    
    # For other exercises (not yet trained)
    elif exercise_type == "shoulder-abduction":
        return (
            "Shoulder abduction detected. Note: Model is only trained for squats. "
            "For accurate form feedback, please use the Squats exercise."
        )
    elif exercise_type == "knee-flexion":
        return (
            "Knee flexion detected. Note: Model is only trained for squats. "
            "For accurate form feedback, please use the Squats exercise."
        )
    elif exercise_type == "arm-raise":
        return (
            "Arm raise detected. Note: Model is only trained for squats. "
            "For accurate form feedback, please use the Squats exercise."
        )

    # Generic fallback
    if status == "correct":
        return "Good posture detected. Maintain this form throughout the movement."
    else:
        return "Your posture needs some adjustment. Move slowly and focus on alignment."


@app.post("/analyze_pose", response_model=AnalyzePoseResponse)
async def analyze_pose_endpoint(payload: AnalyzePoseRequest):
    """
    Main endpoint called by the frontend:
    - payload.image: base64-encoded JPEG from webcam
    - payload.exercise_type: e.g. 'squats', 'shoulder-abduction', etc.
    """
    image_bgr = decode_base64_image(payload.image)

    # Extract pose landmarks
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    result = get_pose().process(image_rgb)
    
    if not result.pose_landmarks:
        # No pose detected in frame
        return AnalyzePoseResponse(
            status="analyzing",
            confidence=0.0,
            repCompleted=False,
            keypoints=[],
            feedback="I can't clearly see your full body. Step back a little and ensure your body is inside the camera frame.",
        )

    keypoints = build_keypoints(result.pose_landmarks, image_bgr.shape)

    # Check if exercise type is supported (only squats have trained model)
    if payload.exercise_type != "squats":
        # For other exercises, only detect if pose is visible (no correctness check)
        return AnalyzePoseResponse(
            status="analyzing",
            confidence=0.5,  # Neutral confidence
            repCompleted=False,
            keypoints=keypoints,
            feedback=f"Pose detection active for {payload.exercise_type}. Note: Model is only trained for squats. For accurate feedback, please use the Squats exercise.",
        )

    # For squats: Use trained model for prediction
    landmarks, pred_label, confidence = run_pose_and_predict(image_bgr)
    
    if landmarks is None:
        return AnalyzePoseResponse(
            status="analyzing",
            confidence=0.0,
            repCompleted=False,
            keypoints=keypoints,
            feedback="I can't clearly see your full body. Step back a little and ensure your body is inside the camera frame.",
        )

    status = "correct" if pred_label == 1 else "incorrect"
    feedback = generate_feedback(payload.exercise_type, status)

    # For now, we are not doing rep counting on the backend.
    # live.js already handles correct/incorrect + feedback + confidence display.
    return AnalyzePoseResponse(
        status=status,
        confidence=confidence,
        repCompleted=False,
        keypoints=keypoints,
        feedback=feedback,
    )


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/sessions")
async def create_session(payload: SessionCreate, user_id: str = Depends(get_current_user_id)):
    parsed_date = parse_iso_datetime(payload.date)

    conn = get_db_conn()
    try:
        cur = conn.execute(
            """
            INSERT INTO sessions (userId, exerciseType, duration, correctReps, incorrectReps, accuracy, avgConfidence, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                payload.exerciseType,
                int(payload.duration),
                int(payload.correctReps),
                int(payload.incorrectReps),
                int(payload.accuracy),
                int(payload.avgConfidence),
                parsed_date.isoformat(),
            ),
        )
        conn.commit()
        return {"id": int(cur.lastrowid)}
    finally:
        conn.close()


@app.get("/sessions/recent", response_model=List[SessionRecord])
async def get_recent_sessions(limit: int = 5, user_id: str = Depends(get_current_user_id)):
    limit = max(1, min(int(limit), 50))
    conn = get_db_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM sessions WHERE userId = ? ORDER BY date DESC LIMIT ?;",
            (user_id, limit),
        ).fetchall()
        return [row_to_session(r) for r in rows]
    finally:
        conn.close()


@app.get("/sessions/history", response_model=List[SessionRecord])
async def get_sessions_history(exercise: Optional[str] = None, user_id: str = Depends(get_current_user_id)):
    conn = get_db_conn()
    try:
        if exercise:
            rows = conn.execute(
                "SELECT * FROM sessions WHERE userId = ? AND exerciseType = ? ORDER BY date DESC;",
                (user_id, exercise),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM sessions WHERE userId = ? ORDER BY date DESC;",
                (user_id,),
            ).fetchall()
        return [row_to_session(r) for r in rows]
    finally:
        conn.close()


@app.get("/stats/aggregate", response_model=AggregateStatsResponse)
async def get_aggregate_stats(user_id: str = Depends(get_current_user_id)):
    conn = get_db_conn()
    try:
        row = conn.execute(
            """
            SELECT
                COUNT(*) AS totalSessions,
                COALESCE(SUM(correctReps + incorrectReps), 0) AS totalReps,
                COALESCE(AVG(accuracy), 0) AS avgAccuracy,
                COALESCE(SUM(duration), 0) AS totalDuration
            FROM sessions
            WHERE userId = ?;
            """
            ,
            (user_id,),
        ).fetchone()

        total_sessions = int(row["totalSessions"]) if row else 0
        total_reps = int(row["totalReps"]) if row else 0
        avg_accuracy = int(round(float(row["avgAccuracy"]))) if row else 0
        total_time = minutes_from_seconds(int(row["totalDuration"]) if row else 0)

        return AggregateStatsResponse(
            totalSessions=total_sessions,
            totalReps=total_reps,
            avgAccuracy=avg_accuracy,
            totalTime=total_time,
        )
    finally:
        conn.close()


@app.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(user_id: str = Depends(get_current_user_id)):
    conn = get_db_conn()
    try:
        row = conn.execute(
            """
            SELECT
                COUNT(*) AS totalSessions,
                COALESCE(AVG(accuracy), 0) AS avgAccuracy,
                COALESCE(SUM(duration), 0) AS totalDuration
            FROM sessions
            WHERE userId = ?;
            """
            ,
            (user_id,),
        ).fetchone()

        total_sessions = int(row["totalSessions"]) if row else 0
        avg_accuracy = int(round(float(row["avgAccuracy"]))) if row else 0
        total_time = minutes_from_seconds(int(row["totalDuration"]) if row else 0)

        days_rows = conn.execute(
            "SELECT date FROM sessions WHERE userId = ? ORDER BY date DESC;",
            (user_id,),
        ).fetchall()
        days = set()
        for r in days_rows:
            try:
                days.add(parse_iso_datetime(r["date"]).date())
            except Exception:
                continue

        streak = 0
        current = date.today()
        while current in days:
            streak += 1
            current = current - timedelta(days=1)

        return DashboardStatsResponse(
            totalSessions=total_sessions,
            avgAccuracy=avg_accuracy,
            totalTime=total_time,
            streak=streak,
        )
    finally:
        conn.close()


@app.post("/advice", response_model=AdviceResponse)
async def get_advice(payload: SessionCreate, user_id: str = Depends(get_current_user_id)):
    accuracy = int(payload.accuracy)

    if accuracy >= 80:
        return AdviceResponse(
            summary=f"Excellent work! Your form accuracy of {accuracy}% shows great control and technique.",
            tips=[
                "Continue with your current routine to maintain progress",
                "Consider increasing repetitions gradually",
                "Stay hydrated and maintain proper rest between sessions",
            ],
        )
    if accuracy >= 50:
        return AdviceResponse(
            summary=f"Good effort! Your {accuracy}% accuracy shows room for improvement.",
            tips=[
                "Focus on slower, more controlled movements",
                "Watch tutorial videos for proper form guidance",
                "Practice in front of a mirror to self-correct",
            ],
        )

    return AdviceResponse(
        summary="Keep practicing! Every session helps build muscle memory and improve form.",
        tips=[
            "Start with fewer repetitions and focus on quality",
            "Consider consulting with a physiotherapist",
            "Warm up properly before each session",
        ],
    )


"""
How to run this backend locally:

1. Install dependencies (ideally in a virtual environment):

   pip install fastapi uvicorn mediapipe opencv-python numpy scikit-learn joblib python-multipart

2. Start the server from the project root (where this file lives):

   Option A (Recommended - using uvicorn directly):
   uvicorn backend_api:app --host 0.0.0.0 --port 8000 --reload

   Option B (Using python - still uses uvicorn under the hood):
   python backend_api.py

3. In your frontend config (js/config.js), set:

   const API_BASE_URL = "http://localhost:8000";

4. Open the frontend in a browser, select the squat exercise, go to the live page,
   and the webcam frames will be sent to /analyze_pose for real-time classification.
"""

# Allow running with: python backend_api.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_api:app", host="0.0.0.0", port=8000, reload=True)

