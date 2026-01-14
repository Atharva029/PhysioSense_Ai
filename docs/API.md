# PhysioSense AI - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require Firebase authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "uid": "user-uid"
}
```

#### Get User Profile
```http
GET /auth/profile/:uid
```

**Response:**
```json
{
  "uid": "user-uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update User Profile
```http
PUT /auth/profile/:uid
```

**Request Body:**
```json
{
  "displayName": "Jane Doe"
}
```

### Exercises

#### Analyze Exercise Frame
```http
POST /exercises/analyze
```

**Request Body:**
```json
{
  "userId": "user-uid",
  "exerciseName": "Shoulder Flexion",
  "poseData": {
    "keypoints": [
      {
        "x": 0.5,
        "y": 0.5,
        "z": 0.0,
        "visibility": 0.9,
        "index": 0
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "analysis": {
    "formScore": 85,
    "deviations": [
      {
        "type": "posture",
        "description": "Shoulder alignment slightly off",
        "severity": "low"
      }
    ],
    "recommendations": [
      "Maintain proper alignment",
      "Focus on controlled movements"
    ]
  },
  "feedback": "Great job on your shoulder flexion exercise!...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Create Exercise Session
```http
POST /exercises/session
```

**Request Body:**
```json
{
  "userId": "user-uid",
  "exerciseName": "Shoulder Flexion",
  "notes": "First session after surgery"
}
```

**Response:**
```json
{
  "message": "Session created successfully",
  "sessionId": "session-id",
  "userId": "user-uid",
  "exerciseName": "Shoulder Flexion",
  "startTime": "2024-01-01T00:00:00.000Z",
  "status": "in-progress"
}
```

#### Update Exercise Session
```http
PUT /exercises/session/:sessionId
```

**Request Body:**
```json
{
  "repetitions": 10,
  "duration": 120
}
```

#### Complete Exercise Session
```http
POST /exercises/session/:sessionId/complete
```

**Request Body:**
```json
{
  "analysis": {
    "formScore": 85,
    "deviations": []
  },
  "repetitions": 10,
  "duration": 120,
  "feedback": "Great session!"
}
```

**Response:**
```json
{
  "message": "Session completed successfully",
  "sessionId": "session-id",
  "status": "completed",
  "formScore": 85
}
```

#### Get User Exercise Sessions
```http
GET /exercises/:userId
```

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 50)
- `exerciseName` (optional): Filter by exercise name

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session-id",
      "userId": "user-uid",
      "exerciseName": "Shoulder Flexion",
      "formScore": 85,
      "repetitions": 10,
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Exercise Session
```http
GET /exercises/session/:sessionId
```

**Response:**
```json
{
  "sessionId": "session-id",
  "userId": "user-uid",
  "exerciseName": "Shoulder Flexion",
  "status": "completed",
  "formScore": 85,
  "repetitions": 10,
  "duration": 120
}
```

### Progress

#### Get User Progress
```http
GET /progress/:userId
```

**Query Parameters:**
- `exerciseName` (optional): Filter by exercise name
- `days` (optional): Number of days to look back (default: 30)

**Response:**
```json
{
  "userId": "user-uid",
  "period": {
    "startDate": "2023-12-01T00:00:00.000Z",
    "endDate": "2024-01-01T00:00:00.000Z",
    "days": 30
  },
  "statistics": {
    "totalSessions": 15,
    "avgFormScore": 82.5,
    "totalRepetitions": 150,
    "totalDuration": 1800,
    "improvement": 12.5
  },
  "sessions": [...],
  "aiSummary": "Your progress has been excellent..."
}
```

#### Get Progress Trends
```http
GET /progress/:userId/trends
```

**Query Parameters:**
- `exerciseName` (optional): Filter by exercise name
- `days` (optional): Number of days to look back (default: 30)

**Response:**
```json
{
  "userId": "user-uid",
  "trends": [
    {
      "date": "2024-01-01",
      "sessions": 2,
      "avgFormScore": 80,
      "totalRepetitions": 20,
      "totalDuration": 240
    }
  ],
  "exerciseName": "all"
}
```

### Health Check

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "PhysioSense AI API is running"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting to prevent abuse.

## Data Models

### User
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Exercise Session
```typescript
interface ExerciseSession {
  sessionId: string;
  userId: string;
  exerciseName: string;
  status: 'in-progress' | 'completed';
  startTime: Date;
  endTime?: Date;
  formScore?: number;
  repetitions?: number;
  duration?: number;
  analysis?: {
    formScore: number;
    deviations: Deviation[];
    recommendations: string[];
  };
  feedback?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

### Deviation
```typescript
interface Deviation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}
```
