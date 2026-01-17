// API functions for backend communication
// - getIdToken() comes from auth.js
// - API_BASE_URL comes from config.js

async function apiRequest(endpoint, options = {}) {
  const token = await getIdToken()

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)

    let message = "Request failed"
    if (error) {
      if (typeof error === "string") {
        message = error
      } else if (error.message) {
        message = error.message
      } else if (error.detail) {
        message = typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail)
      }
    }

    throw new Error(message)
  }

  return response.json()
}

// Pose analysis endpoint
async function analyzePose(imageData, exerciseType) {
  return apiRequest("/analyze_pose", {
    method: "POST",
    body: JSON.stringify({
      image: imageData,
      exercise_type: exerciseType,
    }),
  })
}

// Get user dashboard stats
async function getDashboardStats() {
  return apiRequest("/dashboard/stats", {
    method: "GET",
  })
}

// Get recent sessions
async function getRecentSessions(limit = 5) {
  return apiRequest(`/sessions/recent?limit=${limit}`, {
    method: "GET",
  })
}

// Get session history
async function getSessionHistory(exerciseFilter = "") {
  const params = exerciseFilter ? `?exercise=${exerciseFilter}` : ""
  return apiRequest(`/sessions/history${params}`, {
    method: "GET",
  })
}

// Save session
async function saveSession(sessionData) {
  return apiRequest("/sessions", {
    method: "POST",
    body: JSON.stringify(sessionData),
  })
}

// Get AI advice for session
async function getAIAdvice(sessionData) {
  return apiRequest("/advice", {
    method: "POST",
    body: JSON.stringify(sessionData),
  })
}

// Get aggregate statistics
async function getAggregateStats() {
  return apiRequest("/stats/aggregate", {
    method: "GET",
  })
}
