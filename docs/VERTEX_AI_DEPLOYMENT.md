# Vertex AI Model Deployment Guide

This guide explains how to deploy a custom ML model to Google Vertex AI for exercise form analysis.

## Overview

Vertex AI allows you to deploy custom models for inference. For PhysioSense AI, you can train a model that analyzes pose keypoints and detects form deviations.

## Prerequisites

1. Google Cloud Project with Vertex AI API enabled
2. Google Cloud SDK installed and configured
3. Python 3.8+ with required packages
4. Trained model (TensorFlow, PyTorch, or scikit-learn)

## Step 1: Prepare Your Model

### Model Requirements

Your model should:
- Accept pose keypoints as input (33 landmarks from MediaPipe)
- Output form score and deviation predictions
- Be saved in a format compatible with Vertex AI

### Example Model Structure

```python
# model.py
import tensorflow as tf
from tensorflow import keras

def create_pose_model():
    model = keras.Sequential([
        keras.layers.Dense(128, activation='relu', input_shape=(99,)),  # 33 keypoints * 3 (x, y, z)
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(1, activation='sigmoid')  # Form score (0-1)
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Train and save model
model = create_pose_model()
# ... training code ...
model.save('saved_model/')
```

## Step 2: Create a Custom Container

Vertex AI requires a custom container for model serving.

### Dockerfile

```dockerfile
FROM gcr.io/deeplearning-platform-release/base-cpu

WORKDIR /app

# Copy model files
COPY saved_model/ /app/model/

# Install dependencies
RUN pip install tensorflow==2.13.0

# Copy prediction script
COPY predict.py /app/predict.py

# Set entrypoint
ENTRYPOINT ["python", "predict.py"]
```

### Prediction Script (predict.py)

```python
import json
import sys
import tensorflow as tf
import numpy as np

# Load model
model = tf.keras.models.load_model('/app/model')

def predict(instances):
    """Make predictions on input instances."""
    # Preprocess input
    keypoints = np.array(instances[0]['pose_keypoints'])
    keypoints_flat = keypoints.flatten()
    
    # Reshape for model input
    input_data = np.array([keypoints_flat])
    
    # Make prediction
    prediction = model.predict(input_data)
    
    # Postprocess output
    form_score = float(prediction[0][0] * 100)  # Convert to 0-100 scale
    
    # Detect deviations (simplified example)
    deviations = []
    if form_score < 70:
        deviations.append({
            'type': 'form',
            'description': 'Form score below threshold',
            'severity': 'medium'
        })
    
    return {
        'formScore': form_score,
        'deviations': deviations,
        'recommendations': ['Maintain proper alignment', 'Focus on controlled movements']
    }

if __name__ == '__main__':
    # Read input from stdin
    input_json = sys.stdin.read()
    input_data = json.loads(input_json)
    
    # Make predictions
    results = predict(input_data['instances'])
    
    # Output results
    print(json.dumps({'predictions': [results]}))
```

## Step 3: Build and Push Container

```bash
# Set variables
export PROJECT_ID=your-project-id
export REGION=us-central1
export IMAGE_NAME=physiosense-model

# Build Docker image
docker build -t gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest .

# Push to Google Container Registry
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest
```

## Step 4: Upload Model to Vertex AI

```bash
# Create model
gcloud ai models upload \
  --region=${REGION} \
  --display-name=physiosense-pose-model \
  --container-image-uri=gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest \
  --container-ports=8080 \
  --container-health-route=/health \
  --container-predict-route=/predict
```

## Step 5: Deploy Model to Endpoint

```bash
# Create endpoint
gcloud ai endpoints create \
  --region=${REGION} \
  --display-name=physiosense-endpoint

# Get endpoint ID
ENDPOINT_ID=$(gcloud ai endpoints list \
  --region=${REGION} \
  --filter="displayName=physiosense-endpoint" \
  --format="value(name)" | cut -d'/' -f6)

# Get model ID
MODEL_ID=$(gcloud ai models list \
  --region=${REGION} \
  --filter="displayName=physiosense-pose-model" \
  --format="value(name)" | cut -d'/' -f6)

# Deploy model to endpoint
gcloud ai endpoints deploy-model ${ENDPOINT_ID} \
  --region=${REGION} \
  --model=${MODEL_ID} \
  --display-name=physiosense-deployment \
  --machine-type=n1-standard-2 \
  --min-replica-count=1 \
  --max-replica-count=3
```

## Step 6: Update Backend Configuration

Update `server/config/vertexAI.js`:

```javascript
// Add your endpoint ID
const MODEL_ENDPOINT_ID = 'your-endpoint-id';

// Update analyzeExerciseForm function
async function analyzeExerciseForm(poseData) {
  const modelEndpoint = MODEL_ENDPOINT_ID;
  return await predictWithVertexAI(poseData, modelEndpoint);
}
```

## Step 7: Test the Deployment

```bash
# Test prediction
gcloud ai endpoints predict ${ENDPOINT_ID} \
  --region=${REGION} \
  --json-request=test_request.json
```

Example `test_request.json`:
```json
{
  "instances": [{
    "pose_keypoints": [
      {"x": 0.5, "y": 0.5, "z": 0.0, "visibility": 0.9}
    ],
    "exercise_type": "Shoulder Flexion",
    "timestamp": "2024-01-01T00:00:00Z"
  }]
}
```

## Monitoring and Maintenance

1. **Monitor Performance**: Use Vertex AI Console to monitor model performance
2. **Update Model**: Retrain and redeploy as needed
3. **Scale Resources**: Adjust replica counts based on traffic
4. **Cost Optimization**: Use preemptible instances for development

## Alternative: Use Pre-built Models

For faster setup, you can use MediaPipe's pose estimation directly (as currently implemented) and add custom logic for form analysis without deploying to Vertex AI. Vertex AI is recommended for:
- Custom exercise-specific models
- High-volume inference
- Advanced form analysis requiring deep learning

## Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Custom Container Guide](https://cloud.google.com/vertex-ai/docs/predictions/use-custom-container)
- [Model Deployment Best Practices](https://cloud.google.com/vertex-ai/docs/predictions/deploy-model-api)
