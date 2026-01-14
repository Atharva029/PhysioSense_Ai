// Dashboard page functionality
const requireAuth = (callback) => {
  // Dummy implementation for demonstration purposes
  const user = { name: "John Doe" }
  callback(user)
}

const setupNavigation = (user) => {
  // Dummy implementation for demonstration purposes
  console.log(`Setting up navigation for ${user.name}`)
}

const getDashboardStats = async () => {
  // Dummy implementation for demonstration purposes
  return {
    totalSessions: 10,
    avgAccuracy: 85,
    totalTime: 60,
    streak: 5,
  }
}

const getRecentSessions = async (limit) => {
  // Dummy implementation for demonstration purposes
  return [
    { exerciseType: "shoulder-abduction", date: "2023-10-01T12:00:00", accuracy: 90 },
    { exerciseType: "knee-flexion", date: "2023-10-02T13:30:00", accuracy: 88 },
  ].slice(0, limit)
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth((user) => {
    setupNavigation(user)
    loadDashboardData()
  })
})

async function loadDashboardData() {
  try {
    // Load stats
    const stats = await getDashboardStats().catch(() => ({
      totalSessions: 0,
      avgAccuracy: 0,
      totalTime: 0,
      streak: 0,
    }))

    document.getElementById("total-sessions").textContent = stats.totalSessions || 0
    document.getElementById("avg-accuracy").textContent = `${stats.avgAccuracy || 0}%`
    document.getElementById("total-time").textContent = `${stats.totalTime || 0} min`
    document.getElementById("streak").textContent = `${stats.streak || 0} days`

    // Load recent sessions
    const sessions = await getRecentSessions(5).catch(() => [])
    displayRecentSessions(sessions)
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    displayRecentSessions([])
  }
}

function displayRecentSessions(sessions) {
  const container = document.getElementById("recent-sessions")

  if (!sessions || sessions.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <p>No exercise sessions yet. Start your first exercise!</p>
            </div>
        `
    return
  }

  container.innerHTML = sessions
    .map(
      (session) => `
        <div class="activity-item">
            <div class="activity-info">
                <span class="activity-name">${formatExerciseName(session.exerciseType)}</span>
                <span class="activity-date">${formatDate(session.date)}</span>
            </div>
            <span class="activity-accuracy">${session.accuracy}%</span>
        </div>
    `,
    )
    .join("")
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
    hour: "2-digit",
    minute: "2-digit",
  })
}
