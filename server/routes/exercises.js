const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { analyzeExerciseForm } = require('../config/vertexAI');
const { generateFeedback } = require('../config/gemini');
const { body, validationResult } = require('express-validator');

/**
 * Analyze exercise frame/video
 * POST /api/exercises/analyze
 */
router.post('/analyze', [
  body('userId').notEmpty(),
  body('exerciseName').notEmpty(),
  body('poseData').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, exerciseName, poseData, timestamp } = req.body;

    // Analyze exercise form using Vertex AI
    const analysis = await analyzeExerciseForm({
      keypoints: poseData.keypoints || [],
      exerciseType: exerciseName,
      timestamp: timestamp || new Date().toISOString()
    });

    // Generate feedback using Gemini API
    const feedback = await generateFeedback(
      {
        exerciseName,
        timestamp: timestamp || new Date().toISOString(),
        formScore: analysis.formScore,
        repetitions: poseData.repetitions || 0,
        duration: poseData.duration || 0
      },
      analysis.deviations
    );

    res.json({
      analysis: {
        formScore: analysis.formScore,
        deviations: analysis.deviations,
        recommendations: analysis.recommendations
      },
      feedback,
      timestamp: timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Exercise analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a new exercise session
 * POST /api/exercises/session
 */
router.post('/session', [
  body('userId').notEmpty(),
  body('exerciseName').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { userId, exerciseName, notes } = req.body;

    const sessionData = {
      userId,
      exerciseName,
      notes: notes || '',
      startTime: new Date(),
      status: 'in-progress',
      createdAt: new Date(),
    };

    const sessionRef = await db.collection('exerciseSessions').add(sessionData);

    res.status(201).json({
      message: 'Session created successfully',
      sessionId: sessionRef.id,
      ...sessionData
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update exercise session
 * PUT /api/exercises/session/:sessionId
 */
router.put('/session/:sessionId', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { sessionId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await db.collection('exerciseSessions').doc(sessionId).update(updateData);

    res.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Complete exercise session
 * POST /api/exercises/session/:sessionId/complete
 */
router.post('/session/:sessionId/complete', [
  body('analysis').isObject(),
  body('repetitions').optional().isInt({ min: 0 }),
  body('duration').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { sessionId } = req.params;
    const { analysis, repetitions, duration, feedback } = req.body;

    const sessionData = {
      status: 'completed',
      endTime: new Date(),
      analysis,
      repetitions: repetitions || 0,
      duration: duration || 0,
      formScore: analysis.formScore || 0,
      feedback: feedback || '',
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('exerciseSessions').doc(sessionId).update(sessionData);

    res.json({
      message: 'Session completed successfully',
      sessionId,
      ...sessionData
    });
  } catch (error) {
    console.error('Session completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's exercise sessions
 * GET /api/exercises/:userId
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
    const { limit = 50, exerciseName } = req.query;

    let query = db.collection('exerciseSessions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (exerciseName) {
      query = query.where('exerciseName', '==', exerciseName);
    }

    const snapshot = await query.get();
    const sessions = snapshot.docs.map(doc => ({
      sessionId: doc.id,
      ...doc.data()
    }));

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get specific exercise session
 * GET /api/exercises/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { sessionId } = req.params;
    const sessionDoc = await db.collection('exerciseSessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId,
      ...sessionDoc.data()
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
