# PhysioSenseAI 

PhysioSenseAI is a physiotherapy support project that uses MediaPipe pose estimation and a machine learning model to analyze squat form and provide real-time feedback via a web interface.

This repository combines:
- A **FastAPI backend** that exposes an `/analyze_pose` endpoint.
- A **frontend web app** (static HTML/CSS/JS) under `PHYSIO-Therapy/`.
- **Data collection and training scripts** to build and evaluate the squat classification model.
- **Documentation** describing setup, data collection, and running the system end-to-end.

## Project layout

- `backend_api.py` – FastAPI backend for real-time pose analysis.
- `PHYSIO-Therapy/` – Frontend (HTML/CSS/JS) pages and scripts.
- `Dataset/` – Datasets (CSV) and sample squat videos.
- `Squat_Data/` – Raw `.npy` landmark files for valid/invalid squats.
- `Models/` – Trained model artifacts (e.g. `squat_model.pkl`).
- Data/ML scripts:
  - `train_model.py`
  - `extract_landmarks.py`
  - `extract_landmarks_batch.py`
  - `convert_squat_data_to_csv.py`
  - `analyze_squat_data.py`
  - `check_data_quality.py`
  - `live_inference.py`
  - `record_video_helper.py`
  - `simple_npy_example.py`
- Documentation (read these for details):
  - `HOW_TO_RUN.md` – how to set up and run backend + frontend.
  - `QUICK_START.md` – quick workflow for data collection and training.
  - `README_DATA_COLLECTION.md` – complete data collection guide.
  - Other `*.md` files – assessments, guides, and status notes.

## Main commands

From the project root:

- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

- Start backend API (used by the web frontend):
  ```bash
  python backend_api.py
  # or
  uvicorn backend_api:app --host 0.0.0.0 --port 8000 --reload
  ```

- Open frontend:
  - Open `PHYSIO-Therapy/index.html` in a browser, or
  - Serve it with a simple HTTP server from inside `PHYSIO-Therapy/`.

- Train model:
  ```bash
  python train_model.py
  ```

- Live webcam test without web app:
  ```bash
  python live_inference.py
  ```

For more detailed workflows (data collection, quality checks, extended training), see `QUICK_START.md` and `README_DATA_COLLECTION.md`.
