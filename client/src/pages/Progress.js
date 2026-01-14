import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';
import './Progress.css';

function Progress() {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('All Exercises');

  const fetchProgress = useCallback(async () => {
    try {
      const response = await api.get(`/progress/${currentUser.uid}`);
      setProgress(response.data);
    } catch (err) {
      const isServiceUnavailable = err?.response?.status === 503;
      const fallbackMsg = isServiceUnavailable
        ? 'Service unavailable. Showing sample data.'
        : 'Failed to fetch progress: ' + err.message;
      setError(fallbackMsg);

      // Provide demo data so the UI remains usable even when backend is down
      const sampleSessions = [
        { sessionId: 's1', exerciseName: 'Shoulder Rehabilitation', formScore: 68, repetitions: 10, duration: 300, completedAt: new Date('2024-05-01') },
        { sessionId: 's2', exerciseName: 'Shoulder Rehabilitation', formScore: 75, repetitions: 12, duration: 320, completedAt: new Date('2024-05-03') },
        { sessionId: 's3', exerciseName: 'Shoulder Rehabilitation', formScore: 85, repetitions: 12, duration: 340, completedAt: new Date('2024-05-05') },
        { sessionId: 's4', exerciseName: 'Knee Strengthening', formScore: 92, repetitions: 15, duration: 360, completedAt: new Date('2024-05-07') },
        { sessionId: 's5', exerciseName: 'Knee Strengthening', formScore: 95, repetitions: 16, duration: 370, completedAt: new Date('2024-05-09') },
      ];

      setProgress({
        userId: currentUser?.uid || 'demo',
        period: { startDate: '2024-05-01', endDate: '2024-05-09', days: 9 },
        statistics: {
          totalSessions: sampleSessions.length,
          avgFormScore: 83,
          totalRepetitions: sampleSessions.reduce((sum, s) => sum + (s.repetitions || 0), 0),
          totalDuration: sampleSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
          improvement: 25,
        },
        sessions: sampleSessions,
        aiSummary: 'Improved shoulder range of motion. Keep knees aligned during squats.',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const fetchTrends = useCallback(async () => {
    try {
      const response = await api.get(`/progress/${currentUser.uid}/trends`);
      setTrends(response.data);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    fetchProgress();
    fetchTrends();
  }, [currentUser?.uid, fetchProgress, fetchTrends]);

  const exerciseOptions = useMemo(() => {
    if (!progress?.sessions) return ['All Exercises'];
    const set = new Set(progress.sessions.map((s) => s.exerciseName));
    return ['All Exercises', ...Array.from(set)];
  }, [progress]);

  const chartData = useMemo(() => {
    const sessions = progress?.sessions || [];
    const filtered = selectedExercise === 'All Exercises'
      ? sessions
      : sessions.filter((s) => s.exerciseName === selectedExercise);

    const byDate = {};
    filtered.forEach((s) => {
      const date = new Date(s.completedAt).toISOString().slice(0, 10);
      const score = Number(s.formScore ?? 0);
      if (!byDate[date]) byDate[date] = { date, total: 0, count: 0 };
      byDate[date].total += score;
      byDate[date].count += 1;
    });
    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ date: d.date, avgFormScore: Math.round(d.total / d.count || 0) }));
  }, [progress, selectedExercise]);

  const feedbackItems = useMemo(() => {
    if (!progress?.aiSummary) return [];
    return progress.aiSummary
      .split(/\n|•|-|·/)
      .map((s) => s.trim())
      .filter((s) => s);
  }, [progress]);

  if (loading) {
    return <div className="progress-page"><div className="progress-container"><div className="loading">Loading progress...</div></div></div>;
  }

  return (
    <div className="progress-page">
      <div className="progress-container">
        <h1 className="progress-title">Progress Dashboard</h1>

        {error && <div className="error-message">{error}</div>}

        {progress && (
          <>
            <div className="progress-card">
              <div className="progress-card-header">
                <h2 className="progress-card-title">Your Progress</h2>
                <select
                  className="progress-filter"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                >
                  {exerciseOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData.length ? chartData : (trends?.trends || [])}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.2)" />
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.7)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(26, 11, 46, 0.9)', border: '1px solid rgba(102, 126, 234, 0.3)' }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avgFormScore" stroke="#667eea" strokeWidth={2} name="Form Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="cards-grid">
              <div className="progress-card">
                <h2 className="progress-card-title">Recent Sessions</h2>
                <ul className="sessions-list">
                  {(progress.sessions || []).slice(0, 5).map((s) => (
                    <li key={s.sessionId}>
                      <div>
                        <div className="session-name">{s.exerciseName}</div>
                        <div className="session-date">{new Date(s.completedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="session-score">{s.formScore !== undefined && s.formScore !== null ? `${Math.round(s.formScore)}%` : 'N/A'}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="progress-card">
                <h2 className="progress-card-title">Feedback Summary</h2>
                {feedbackItems.length ? (
                  <ul className="feedback-list">
                    {feedbackItems.map((item, idx) => {
                      const isPositive = /improv|good|better|aligned|correct/i.test(item);
                      return (
                        <li key={idx} className="feedback-item">
                          <span className={`feedback-dot ${isPositive ? 'green' : 'yellow'}`}></span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="empty-state-text">No AI feedback available yet.</div>
                )}
              </div>
            </div>






          </>
        )}
      </div>
    </div>
  );
}

export default Progress;
