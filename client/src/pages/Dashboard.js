import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

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
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        Welcome, {currentUser?.email?.split('@')[0]}!
      </h1>
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Available Exercises</h2>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Select an exercise to begin your session. Our AI will monitor your form and provide real-time feedback.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {EXERCISES.map((exercise) => (
            <div
              key={exercise.name}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                border: '2px solid #e0e0e0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
              onClick={() => startExercise(exercise.name)}
            >
              <h3 style={{ marginBottom: '10px', color: '#667eea' }}>
                {exercise.name}
              </h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                {exercise.description}
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                Start Exercise
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
