// History page functionality

// Declare requireAuth, setupNavigation, getAggregateStats, and getSessionHistory functions or import them
function requireAuth(callback) {
  // Dummy implementation for the sake of example
  const user = { name: "John Doe" }
  callback(user)
}

function setupNavigation(user) {
  // Dummy implementation for the sake of example
  console.log("Setting up navigation for user:", user.name)
}

async function getAggregateStats() {
  // Dummy implementation for the sake of example
  return {
    totalSessions: 5,
    totalReps: 20,
    avgAccuracy: 85,
    totalTime: 30,
  }
}

async function getSessionHistory(exerciseFilter) {
  // Dummy implementation for the sake of example
  return [
    {
      exerciseType: "shoulder-abduction",
      date: "2023-10-01T12:00:00",
      accuracy: 90,
      correctReps: 10,
      incorrectReps: 2,
      duration: 180,
    },
    {
      exerciseType: "knee-flexion",
      date: "2023-10-02T13:30:00",
      accuracy: 88,
      correctReps: 12,
      incorrectReps: 1,
      duration: 210,
    },
  ]
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth((user) => {
    setupNavigation(user)
    loadHistoryData()
    setupFilter()
  })
})

async function loadHistoryData(exerciseFilter = "") {
  try {
    // Load aggregate stats
    const stats = await getAggregateStats().catch(() => ({
      totalSessions: 0,
      totalReps: 0,
      avgAccuracy: 0,
      totalTime: 0,
    }))

    document.getElementById("total-sessions").textContent = stats.totalSessions || 0
    document.getElementById("total-reps").textContent = stats.totalReps || 0
    document.getElementById("avg-accuracy").textContent = `${stats.avgAccuracy || 0}%`
    document.getElementById("total-time").textContent = `${stats.totalTime || 0} min`

    // Load session history
    const sessions = await getSessionHistory(exerciseFilter).catch(() => [])
    displayHistory(sessions)
  } catch (error) {
    console.error("Error loading history data:", error)
    displayHistory([])
  }
}

function displayHistory(sessions) {
  const container = document.getElementById("history-list")

  if (!sessions || sessions.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <p>No exercise sessions found. Start exercising to see your history!</p>
            </div>
        `
    return
  }

  container.innerHTML = sessions
    .map(
      (session) => `
        <div class="history-item">
            <div class="history-item-info">
                <span class="history-item-name">${formatExerciseName(session.exerciseType)}</span>
                <span class="history-item-date">${formatDate(session.date)}</span>
            </div>
            <div class="history-item-stats">
                <div class="history-item-stat">
                    <span class="value">${session.accuracy}%</span>
                    <span class="label">Accuracy</span>
                </div>
                <div class="history-item-stat">
                    <span class="value">${session.correctReps + session.incorrectReps}</span>
                    <span class="label">Reps</span>
                </div>
                <div class="history-item-stat">
                    <span class="value">${formatDuration(session.duration)}</span>
                    <span class="label">Duration</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function setupFilter() {
  const filterSelect = document.getElementById("filter-exercise")

  filterSelect.addEventListener("change", (e) => {
    loadHistoryData(e.target.value)
  })
}

function formatExerciseName(type) {
  const names = {
    "shoulder-abduction": "Shoulder Abduction",
    "knee-flexion": "Knee Flexion",
    "arm-raise": "Arm Raise",
    squats: "Squats",
  }
  return names[type] || type
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
