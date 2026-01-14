const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
const { body, validationResult } = require('express-validator');

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!auth || !db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { email, password, displayName } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: 'User created successfully',
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get user profile
 * GET /api/auth/profile/:uid
 */
router.get('/profile/:uid', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user profile
 * PUT /api/auth/profile/:uid
 */
router.put('/profile/:uid', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        error: 'Firebase not configured', 
        message: 'Please set up Firebase environment variables in server/.env file' 
      });
    }

    const { uid } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await db.collection('users').doc(uid).update(updateData);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
