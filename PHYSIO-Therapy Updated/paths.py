from pathlib import Path

# Root of the project (this file lives in the project root)
PROJECT_ROOT = Path(__file__).resolve().parent

# Core directories
DATASET_DIR = PROJECT_ROOT / "Dataset"
MODELS_DIR = PROJECT_ROOT / "Models"
SQUAT_DATA_DIR = PROJECT_ROOT / "Squat_Data"

# Common files
DEFAULT_MODEL_PATH = MODELS_DIR / "squat_model.pkl"

# Frequently used datasets
SQUAT_DATASET_CSV = DATASET_DIR / "squat_dataset.csv"
SQUAT_DATASET_FIXED_CSV = DATASET_DIR / "squat_dataset_fixed.csv"
SQUAT_DATASET_FROM_NPY_CSV = DATASET_DIR / "squat_dataset_from_npy.csv"
SQUAT_DATASET_EXTENDED_CSV = DATASET_DIR / "squat_dataset_extended.csv"
SQUAT_DATASET_COMBINED_CSV = DATASET_DIR / "squat_dataset_combined.csv"
