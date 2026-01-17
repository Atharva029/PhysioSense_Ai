// History page functionality

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
