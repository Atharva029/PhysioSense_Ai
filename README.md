# PhysioSense AI

An AI-powered system that uses computer vision to analyze patient movements during physiotherapy exercises, detect posture deviations, track progress over time, and provide personalized feedback to improve recovery outcomes.

## Features

- 🎥 **Real-time Exercise Monitoring**: Capture and analyze physiotherapy exercises using computer vision
- 📊 **Posture Deviation Detection**: Identify incorrect movements and posture issues
- 📈 **Progress Tracking**: Monitor recovery progress over time with detailed analytics
- 💬 **Personalized Feedback**: AI-generated explanations and recommendations using Google Gemini
- 🔐 **Secure User Management**: Firebase authentication and data storage
- 🤖 **AI-Powered Analysis**: Google Vertex AI for model deployment

## Tech Stack

- **Frontend**: React.js with MediaPipe for pose estimation
- **Backend**: Node.js/Express.js
- **Computer Vision**: MediaPipe Pose
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Services**: 
  - Google Vertex AI (Model deployment)
  - Google Gemini API (Feedback generation)

## Project Structure

```
PhysioSense_Ai/
├── client/                 # React frontend application
├── server/                 # Node.js backend API
├── models/                 # ML models and pose estimation logic
└── docs/                   # Documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- Google Cloud Platform account with Vertex AI and Gemini API enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PhysioSense_Ai
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:

**Server (.env):**
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
GEMINI_API_KEY=your-gemini-api-key
VERTEX_AI_PROJECT_ID=your-vertex-project-id
VERTEX_AI_LOCATION=us-central1
```

**Client (.env):**
```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Sign Up/Login**: Create an account or login using Firebase Authentication
2. **Select Exercise**: Choose from available physiotherapy exercises
3. **Record Session**: Use your webcam to record exercise performance
4. **Get Feedback**: Receive real-time analysis and personalized feedback
5. **Track Progress**: View your recovery progress over time

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/exercises/analyze` - Analyze exercise video/frame
- `GET /api/exercises/:userId` - Get user's exercise history
- `POST /api/exercises/session` - Create new exercise session
- `PUT /api/exercises/session/:sessionId` - Update session data
- `GET /api/progress/:userId` - Get user progress summary

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
