# PhysioSense AI - Architecture Documentation

## System Overview

PhysioSense AI is a full-stack web application that uses computer vision and AI to monitor physiotherapy exercises in real-time. The system consists of a React frontend, Node.js/Express backend, and integrates with Firebase, Google Vertex AI, and Google Gemini API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │  Exercise    │  │   Progress   │     │
│  │   Component  │  │   Session    │  │   Component  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  MediaPipe Pose │                       │
│                   │   Estimation    │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    Backend (Node.js/Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │  Exercise    │  │   Progress   │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌────▼──────┐     │
│  │  Firebase   │  │   Vertex AI     │  │  Gemini   │     │
│  │   Admin     │  │   Analysis      │  │   API     │     │
│  └─────────────┘  └─────────────────┘  └───────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                          │              │
         │                          │              │
    ┌────▼────┐              ┌──────▼──────┐  ┌───▼────┐
    │Firestore│              │ Vertex AI   │  │ Gemini │
    │Database │              │   Models    │  │  API   │
    └─────────┘              └─────────────┘  └────────┘
```

## Component Details

### Frontend Components

#### 1. **MediaPipe Pose Estimation** (`client/src/utils/poseEstimation.js`)
- Uses MediaPipe Pose model for real-time pose detection
- Extracts 33 body landmarks from video feed
- Calculates angles and distances for form analysis
- Runs entirely in the browser (client-side processing)

#### 2. **Exercise Session Component** (`client/src/pages/ExerciseSession.js`)
- Captures video from user's webcam
- Processes frames through MediaPipe
- Sends pose data to backend for analysis
- Displays real-time feedback and form scores

#### 3. **Progress Tracking** (`client/src/pages/Progress.js`)
- Visualizes exercise history with charts
- Shows statistics and trends
- Displays AI-generated progress summaries

### Backend Components

#### 1. **Authentication Routes** (`server/routes/auth.js`)
- User registration and profile management
- Integrates with Firebase Auth
- Stores user data in Firestore

#### 2. **Exercise Routes** (`server/routes/exercises.js`)
- Creates and manages exercise sessions
- Analyzes pose data using Vertex AI
- Generates feedback using Gemini API
- Stores session data in Firestore

#### 3. **Progress Routes** (`server/routes/progress.js`)
- Retrieves user exercise history
- Calculates statistics and trends
- Generates AI summaries using Gemini

### External Services

#### 1. **Firebase**
- **Authentication**: User sign-up and login
- **Firestore**: Stores user profiles, exercise sessions, and progress data
- **Real-time Updates**: Enables live data synchronization

#### 2. **Google Vertex AI**
- **Model Deployment**: Hosts custom ML models for exercise analysis
- **Form Analysis**: Processes pose data to detect deviations
- **Scalability**: Handles high-volume inference requests

#### 3. **Google Gemini API**
- **Feedback Generation**: Creates personalized exercise feedback
- **Progress Summaries**: Generates natural language progress reports
- **Natural Language Processing**: Converts analysis data into readable text

## Data Flow

### Exercise Session Flow

1. **User starts session**:
   - Frontend creates session via `/api/exercises/session`
   - Backend stores session in Firestore

2. **Real-time analysis**:
   - MediaPipe processes video frames (client-side)
   - Pose keypoints extracted and sent to backend
   - Backend calls Vertex AI for form analysis
   - Deviations and form score calculated

3. **Feedback generation**:
   - Analysis results sent to Gemini API
   - AI generates personalized feedback text
   - Feedback displayed to user in real-time

4. **Session completion**:
   - User stops recording
   - Final analysis and statistics saved
   - Session marked as completed in Firestore

### Progress Tracking Flow

1. **Data retrieval**:
   - Frontend requests progress data
   - Backend queries Firestore for user sessions
   - Statistics calculated from session data

2. **AI summary generation**:
   - Session data sent to Gemini API
   - AI generates comprehensive progress summary
   - Summary displayed to user

## Security Considerations

1. **Authentication**: All API routes require Firebase authentication
2. **Authorization**: Users can only access their own data
3. **Data Privacy**: Pose data processed securely, not stored as raw video
4. **API Keys**: Stored securely in environment variables
5. **HTTPS**: Required for camera access in production

## Scalability

1. **Frontend**: Can be deployed to CDN (Firebase Hosting, Vercel)
2. **Backend**: Can be deployed to Google Cloud Run for auto-scaling
3. **Database**: Firestore scales automatically
4. **AI Services**: Vertex AI and Gemini API handle scaling automatically

## Future Enhancements

1. **Custom ML Models**: Train exercise-specific models for better accuracy
2. **Video Storage**: Store exercise videos for review and analysis
3. **Mobile App**: Native mobile applications for iOS and Android
4. **Therapist Dashboard**: Allow therapists to monitor patient progress
5. **Exercise Library**: Expandable library of physiotherapy exercises
6. **Real-time Collaboration**: Live sessions with therapists
