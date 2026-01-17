import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

# Try to load the best available dataset (prioritize fixed/larger datasets)
from paths import (
    DATASET_DIR,
    MODELS_DIR,
    SQUAT_DATASET_FIXED_CSV,
    SQUAT_DATASET_FROM_NPY_CSV,
    SQUAT_DATASET_COMBINED_CSV,
    SQUAT_DATASET_EXTENDED_CSV,
    SQUAT_DATASET_CSV,
)

datasets = [
    SQUAT_DATASET_FIXED_CSV,     # Fixed dataset (99 features, matches MediaPipe)
    SQUAT_DATASET_FROM_NPY_CSV,  # New large dataset (21K+ samples, 132 features)
    SQUAT_DATASET_COMBINED_CSV,  # Combined (existing + new)
    SQUAT_DATASET_EXTENDED_CSV,  # New videos only
    SQUAT_DATASET_CSV,           # Original
]

dataset_path = None
for ds in datasets:
    if ds.exists():
        dataset_path = ds
        break

if not dataset_path:
    print("❌ Error: No dataset found!")
    print("Available files in Dataset folder:")
    if DATASET_DIR.exists():
        for f in sorted(p.name for p in DATASET_DIR.iterdir()):
            print(f"  - {f}")
    exit(1)

print(f"📊 Loading dataset: {dataset_path}")
df = pd.read_csv(dataset_path)

X = df.drop("label", axis=1)
y = df["label"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n" + "=" * 70)
print("📊 MODEL EVALUATION")
print("=" * 70)
print(f"\n✅ Accuracy: {accuracy:.2%}")
print(f"\n📈 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Incorrect', 'Correct']))

print(f"\n📊 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"                Predicted")
print(f"              Incorrect  Correct")
print(f"Actual Incorrect   {cm[0][0]:4d}     {cm[0][1]:4d}")
print(f"       Correct     {cm[1][0]:4d}     {cm[1][1]:4d}")

# Save model
MODELS_DIR.mkdir(parents=True, exist_ok=True)
model_path = MODELS_DIR / "squat_model.pkl"
joblib.dump(model, str(model_path))

print("\n" + "=" * 70)
print(f"✅ Model trained and saved to: {model_path}")
print("=" * 70)
print(f"\n📊 Dataset Statistics:")
print(f"   Total samples: {len(df)}")
print(f"   Training samples: {len(X_train)}")
print(f"   Test samples: {len(X_test)}")
print(f"   Correct samples: {len(df[df['label']==1])}")
print(f"   Incorrect samples: {len(df[df['label']==0])}")
