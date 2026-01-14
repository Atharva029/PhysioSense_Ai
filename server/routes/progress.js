const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { generateProgressSummary } = require('../config/gemini');

/**
 * Get user progress summary
 * GET /api/progress/:userId
 */
router.get('/:userId', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { userId } = req.params;
    const { exerciseName, days = 30 } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = db.collection('exerciseSessions')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .where('completedAt', '>=', startDate)
      .orderBy('completedAt', 'desc');

    if (exerciseName) {
      query = query.where('exerciseName', '==', exerciseName);
    }

    const snapshot = await query.get();
    const sessions = snapshot.docs.map(doc => ({
      sessionId: doc.id,
      ...doc.data()
    }));

    // Calculate statistics
    const stats = calculateProgressStats(sessions);

    // Generate AI summary using Gemini
    const aiSummary = await generateProgressSummary(sessions);

    res.json({
      userId,
      period: {
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        days: parseInt(days)
      },
      statistics: stats,
      sessions: sessions.slice(0, 20), // Return last 20 sessions
      aiSummary
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get progress trends
 * GET /api/progress/:userId/trends
 */
router.get('/:userId/trends', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { userId } = req.params;
    const { exerciseName, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = db.collection('exerciseSessions')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .where('completedAt', '>=', startDate)
      .orderBy('completedAt', 'asc');

    if (exerciseName) {
      query = query.where('exerciseName', '==', exerciseName);
    }

    const snapshot = await query.get();
    const sessions = snapshot.docs.map(doc => doc.data());

    // Group by date for trend analysis
    const trends = sessions.reduce((acc, session) => {
      const date = new Date(session.completedAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          sessions: 0,
          avgFormScore: 0,
          totalRepetitions: 0,
          totalDuration: 0
        };
      }
      acc[date].sessions += 1;
      acc[date].avgFormScore += session.formScore || 0;
      acc[date].totalRepetitions += session.repetitions || 0;
      acc[date].totalDuration += session.duration || 0;
      return acc;
    }, {});

    // Calculate averages
    Object.keys(trends).forEach(date => {
      const day = trends[date];
      day.avgFormScore = day.sessions > 0 ? day.avgFormScore / day.sessions : 0;
    });

    res.json({
      userId,
      trends: Object.values(trends),
      exerciseName: exerciseName || 'all'
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Calculate progress statistics
 * @param {Array} sessions - Array of exercise sessions
 * @returns {Object} Statistics object
 */
function calculateProgressStats(sessions) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      avgFormScore: 0,
      totalRepetitions: 0,
      totalDuration: 0,
      improvement: 0
    };
  }

  const formScores = sessions.map(s => s.formScore || 0).filter(s => s > 0);
  const totalRepetitions = sessions.reduce((sum, s) => sum + (s.repetitions || 0), 0);
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  const avgFormScore = formScores.length > 0
    ? formScores.reduce((sum, score) => sum + score, 0) / formScores.length
    : 0;

  // Calculate improvement (compare first half vs second half)
  let improvement = 0;
  if (formScores.length >= 4) {
    const midpoint = Math.floor(formScores.length / 2);
    const firstHalf = formScores.slice(0, midpoint);
    const secondHalf = formScores.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    improvement = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  return {
    totalSessions: sessions.length,
    avgFormScore: Math.round(avgFormScore * 10) / 10,
    totalRepetitions,
    totalDuration,
    improvement: Math.round(improvement * 10) / 10
  };
}

module.exports = router;
