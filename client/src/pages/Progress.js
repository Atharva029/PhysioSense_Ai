import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

function Progress() {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
    fetchTrends();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get(`/progress/${currentUser.uid}`);
      setProgress(response.data);
    } catch (err) {
      setError('Failed to fetch progress: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await api.get(`/progress/${currentUser.uid}/trends`);
      setTrends(response.data);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading progress...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>Your Progress</h1>

      {error && <div className="error">{error}</div>}

      {progress && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#667eea', fontSize: '32px', marginBottom: '5px' }}>
                  {progress.statistics.totalSessions}
                </h3>
                <p style={{ color: '#666' }}>Total Sessions</p>
              </div>
              <div>
                <h3 style={{ color: '#667eea', fontSize: '32px', marginBottom: '5px' }}>
                  {progress.statistics.avgFormScore}
                </h3>
                <p style={{ color: '#666' }}>Average Form Score</p>
              </div>
              <div>
                <h3 style={{ color: '#667eea', fontSize: '32px', marginBottom: '5px' }}>
                  {progress.statistics.totalRepetitions}
                </h3>
                <p style={{ color: '#666' }}>Total Repetitions</p>
              </div>
              <div>
                <h3 style={{ color: progress.statistics.improvement > 0 ? '#28a745' : '#dc3545', fontSize: '32px', marginBottom: '5px' }}>
                  {progress.statistics.improvement > 0 ? '+' : ''}{progress.statistics.improvement}%
                </h3>
                <p style={{ color: '#666' }}>Improvement</p>
              </div>
            </div>
          </div>

          {trends && trends.trends.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h2 style={{ marginBottom: '20px' }}>Form Score Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgFormScore"
                    stroke="#667eea"
                    strokeWidth={2}
                    name="Form Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {progress.aiSummary && (
            <div className="card">
              <h2 style={{ marginBottom: '20px' }}>AI Progress Summary</h2>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {progress.aiSummary}
              </div>
            </div>
          )}

          {progress.sessions && progress.sessions.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h2 style={{ marginBottom: '20px' }}>Recent Sessions</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Exercise</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Form Score</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Repetitions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.sessions.map((session) => (
                      <tr key={session.sessionId} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}>
                          {new Date(session.completedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px' }}>{session.exerciseName}</td>
                        <td style={{ padding: '12px' }}>{session.formScore || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{session.repetitions || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Progress;
