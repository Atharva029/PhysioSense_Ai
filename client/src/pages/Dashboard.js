import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import './Dashboard.css';

const EXERCISES = [
  { name: 'Shoulder Flexion', description: 'Raise your arm forward and upward' },
  { name: 'Knee Extension', description: 'Straighten your knee while seated' },
  { name: 'Ankle Pumps', description: 'Point and flex your foot' },
  { name: 'Hip Abduction', description: 'Lift your leg to the side' },
  { name: 'Neck Rotation', description: 'Slowly rotate your head' },
];

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const startExercise = (exerciseName) => {
    navigate(`/exercise/${encodeURIComponent(exerciseName)}`);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1 className="dashboard-title">
          Welcome, {currentUser?.email?.split('@')[0]}!
        </h1>
        <div className="dashboard-card">
          <h2 style={{ marginBottom: '20px', color: 'white' }}>Available Exercises</h2>
          <p className="dashboard-description">
            Select an exercise to begin your session. Our AI will monitor your form and provide real-time feedback.
          </p>
          <div className="exercises-grid">
            {EXERCISES.map((exercise) => (
              <div
                key={exercise.name}
                className="exercise-card"
                onClick={() => startExercise(exercise.name)}
              >
                <h3 className="exercise-name">
                  {exercise.name}
                </h3>
                <p className="exercise-description">
                  {exercise.description}
                </p>
                <button className="exercise-button">
                  Start Exercise
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
