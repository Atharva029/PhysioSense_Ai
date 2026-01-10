import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initializePose, stopPose, extractKeypoints } from '../utils/poseEstimation';
import api from '../config/api';
import '../App.css';

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await initializePose(videoRef.current, canvasRef.current, handlePoseResults);
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
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
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ marginBottom: '20px' }}>
            {decodeURIComponent(exerciseName)}
          </h2>
          
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                borderRadius: '8px',
                transform: 'scaleX(-1)',
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)',
              }}
              width={640}
              height={480}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {!isRecording ? (
              <button
                className="btn btn-success"
                onClick={startRecording}
                style={{ flex: 1 }}
              >
                Start Recording
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={stopRecording}
                style={{ flex: 1 }}
              >
                Stop & Save
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ marginBottom: '20px' }}>Live Analysis</h3>
          
          {isRecording && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Repetitions:</span>
                <strong>{repetitions}</strong>
              </div>
              {analysis && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Form Score:</span>
                    <strong style={{ color: analysis.formScore > 70 ? '#28a745' : '#dc3545' }}>
                      {analysis.formScore}/100
                    </strong>
                  </div>
                  {analysis.deviations && analysis.deviations.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <strong>Issues Detected:</strong>
                      <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                        {analysis.deviations.map((dev, idx) => (
                          <li key={idx} style={{ color: '#dc3545', marginBottom: '5px' }}>
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
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>AI Feedback:</h4>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  lineHeight: '1.6',
                }}
              >
                {feedback}
              </div>
            </div>
          )}

          {!isRecording && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Click "Start Recording" to begin your exercise session.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseSession;
