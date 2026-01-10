const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

// Initialize Gemini only if API key is available
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Gemini API initialized successfully');
  } catch (error) {
    console.warn('⚠️  Failed to initialize Gemini API:', error.message);
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not set. Gemini features will be disabled.');
}

/**
 * Generate feedback explanation using Gemini API
 * @param {Object} analysisData - Exercise analysis data
 * @param {Object} deviations - Detected posture deviations
 * @returns {Promise<string>} Generated feedback text
 */
async function generateFeedback(analysisData, deviations) {
  try {
    if (!model) {
      return 'Thank you for completing your exercise session. Keep up the great work! Continue practicing to improve your form and recovery.';
    }

    const prompt = `You are a professional physiotherapist AI assistant. Analyze the following exercise data and provide personalized, encouraging feedback.

Exercise: ${analysisData.exerciseName}
Session Date: ${new Date(analysisData.timestamp).toLocaleDateString()}

Detected Issues:
${deviations.length > 0 
  ? deviations.map(d => `- ${d.type}: ${d.description} (Severity: ${d.severity})`).join('\n')
  : 'No major issues detected - excellent form!'}

Key Metrics:
- Repetition Count: ${analysisData.repetitions || 0}
- Average Form Score: ${analysisData.formScore || 'N/A'}
- Exercise Duration: ${analysisData.duration || 'N/A'} seconds

Please provide:
1. A brief summary of the performance
2. Specific corrections for any detected issues
3. Encouragement and motivation
4. Tips for improvement in the next session

Keep the tone professional yet warm and supportive.`;

    if (!model) {
      return 'Thank you for completing your exercise session. Keep up the great work! Continue practicing to improve your form and recovery.';
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini feedback:', error);
    return 'Thank you for completing your exercise session. Keep up the great work!';
  }
}

/**
 * Generate progress summary using Gemini API
 * @param {Array} sessions - Array of exercise sessions
 * @returns {Promise<string>} Generated progress summary
 */
async function generateProgressSummary(sessions) {
  try {
    if (!sessions || sessions.length === 0) {
      return 'No exercise sessions recorded yet. Start your first session to track progress!';
    }

    const sessionsData = sessions.map(s => ({
      date: s.timestamp,
      exercise: s.exerciseName,
      formScore: s.formScore,
      repetitions: s.repetitions,
      duration: s.duration
    }));

    const prompt = `You are a professional physiotherapist AI assistant. Analyze the following exercise progress data and provide a comprehensive progress summary.

Exercise Sessions (${sessions.length} total):
${sessionsData.map((s, i) => 
  `Session ${i + 1} (${new Date(s.date).toLocaleDateString()}):
  - Exercise: ${s.exercise}
  - Form Score: ${s.formScore || 'N/A'}
  - Repetitions: ${s.repetitions || 0}
  - Duration: ${s.duration || 'N/A'} seconds`
).join('\n\n')}

Please provide:
1. Overall progress assessment
2. Trends and improvements over time
3. Areas that need attention
4. Recommendations for continued recovery
5. Motivational message

Keep the tone professional, encouraging, and supportive.`;

    if (!model) {
      return 'Your progress is being tracked. Continue with your exercises for detailed insights!';
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating progress summary:', error);
    return 'Your progress is being tracked. Continue with your exercises for detailed insights!';
  }
}

module.exports = {
  generateFeedback,
  generateProgressSummary
};
