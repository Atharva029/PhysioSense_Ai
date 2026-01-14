import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initializePose, stopPose, extractKeypoints } from '../utils/poseEstimation';
import api from '../config/api';
import '../App.css';
import './ExerciseSession.css';

function ExerciseSession() {
  const { exerciseName } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [repetitions, setRepetitions] = useState(0);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    startSession();
    initializeCamera();

    return () => {
      stopPose();
    };
  }, []);

  const startSession = async () => {
    try {
      const response = await api.post('/exercises/session', {
        userId: currentUser.uid,
        exerciseName: decodeURIComponent(exerciseName),
      });
      setSessionId(response.data.sessionId);
    } catch (err) {
      setError('Failed to start session: ' + err.message);
    }
  };

  const initializeCamera = async () => {
    try {
      // Request camera permissions with fallback constraints
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await initializePose(videoRef.current, canvasRef.current, handlePoseResults);
      }
    } catch (err) {
      // Provide more helpful error messages
      let errorMessage = 'Failed to access camera: ';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDenied') {
        errorMessage += 'Permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera device found. Please connect a camera.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use. Please close other applications using the camera.';
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
    }
  };

  const handlePoseResults = async (results) => {
    if (!isRecording || isAnalyzing) return;

    const keypoints = extractKeypoints(results);
    if (keypoints.length === 0) return;

    // Analyze every 30 frames (approximately once per second at 30fps)
    if (Math.random() < 0.033) {
      analyzeFrame(keypoints);
    }
  };

  const analyzeFrame = async (keypoints) => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/exercises/analyze', {
        userId: currentUser.uid,
        exerciseName: decodeURIComponent(exerciseName),
        poseData: {
          keypoints,
          timestamp: new Date().toISOString(),
        },
      });

      setAnalysis(response.data.analysis);
      setFeedback(response.data.feedback);
      
      // Update repetitions (simplified - in production, use proper rep counting)
      if (response.data.analysis.formScore > 70) {
        setRepetitions((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    }
    setIsAnalyzing(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRepetitions(0);
    setAnalysis(null);
    setFeedback('');
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    if (sessionId) {
      try {
        await api.post(`/exercises/session/${sessionId}/complete`, {
          analysis: analysis || {},
          repetitions,
          duration: 0, // Calculate actual duration
          feedback,
        });
        alert('Session saved successfully!');
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to save session: ' + err.message);
      }
    }
  };

  return (
    <div className="exercise-page">
      <div className="exercise-container">
        <div className="exercise-video-section">
          <div className="exercise-card">
            <h2 className="exercise-title">
              {decodeURIComponent(exerciseName)}
            </h2>
            
            <div className="exercise-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  transform: 'scaleX(-1)',
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: 'scaleX(-1)',
                }}
                width={640}
                height={480}
              />
            </div>

            <div className="exercise-buttons">
              {!isRecording ? (
                <button
                  className="exercise-button exercise-button-start"
                  onClick={startRecording}
                >
                  Start Recording
                </button>
              ) : (
                <button
                  className="exercise-button exercise-button-stop"
                  onClick={stopRecording}
                >
                  Stop & Save
                </button>
              )}
              <button
                className="exercise-button exercise-button-cancel"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            </div>

            {error && <div className="exercise-error">{error}</div>}
          </div>
        </div>

        <div className="exercise-analysis-section">
          <div className="exercise-card">
            <h3 className="analysis-title">Live Analysis</h3>
            
            {isRecording && (
              <div>
                <div className="analysis-stat">
                  <span className="analysis-label">Repetitions:</span>
                  <span className="analysis-value">{repetitions}</span>
                </div>
                {analysis && (
                  <>
                    <div className="analysis-stat">
                      <span className="analysis-label">Form Score:</span>
                      <span className="analysis-value" style={{ color: analysis.formScore > 70 ? '#28a745' : '#dc3545' }}>
                        {analysis.formScore}/100
                      </span>
                    </div>
                    {analysis.deviations && analysis.deviations.length > 0 && (
                      <div className="analysis-issues">
                        <div className="analysis-issues-title">Issues Detected:</div>
                        <ul>
                          {analysis.deviations.map((dev, idx) => (
                            <li key={idx}>
                              {dev.description} ({dev.severity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {feedback && (
              <div className="feedback-section">
                <div className="feedback-title">AI Feedback:</div>
                <div className="feedback-text">
                  {feedback}
                </div>
              </div>
            )}

            {!isRecording && (
              <p className="placeholder-message">
                Click "Start Recording" to begin your exercise session.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseSession;
