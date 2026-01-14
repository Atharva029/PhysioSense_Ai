// Summary page functionality

// Declare requireAuth, setupNavigation, and getAIAdvice functions or import them
function requireAuth(callback) {
  // Placeholder for authentication logic
  const user = { name: "John Doe" } // Example user object
  callback(user)
}

function setupNavigation(user) {
  // Placeholder for navigation setup logic
  console.log(`Setting up navigation for user: ${user.name}`)
}

async function getAIAdvice(summaryData) {
  // Placeholder for AI advice retrieval logic
  return {
    summary: "AI advice summary",
    tips: ["Tip 1", "Tip 2", "Tip 3"],
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth((user) => {
    setupNavigation(user)
    loadSummaryData()
  })
})

async function loadSummaryData() {
  const summaryDataStr = sessionStorage.getItem("sessionSummary")

  if (!summaryDataStr) {
    window.location.href = "dashboard.html"
    return
  }

  const summaryData = JSON.parse(summaryDataStr)

  // Display exercise name
  document.getElementById("exercise-name").textContent = formatExerciseName(summaryData.exerciseType)

  // Display accuracy with animation
  const accuracy = summaryData.accuracy || 0
  document.getElementById("accuracy-value").textContent = `${accuracy}%`
  document.getElementById("accuracy-circle").setAttribute("stroke-dasharray", `${accuracy}, 100`)

  // Display rep counts
  document.getElementById("correct-count").textContent = summaryData.correctReps || 0
  document.getElementById("incorrect-count").textContent = summaryData.incorrectReps || 0

  // Display duration
  const minutes = Math.floor((summaryData.duration || 0) / 60)
  const seconds = (summaryData.duration || 0) % 60
  document.getElementById("duration").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

  // Load AI advice
  await loadAIAdvice(summaryData)

  // Clear session storage
  sessionStorage.removeItem("sessionSummary")
  sessionStorage.removeItem("selectedExercise")
}

async function loadAIAdvice(summaryData) {
  const adviceContainer = document.getElementById("advice-content")

  try {
    const advice = await getAIAdvice(summaryData)

    adviceContainer.innerHTML = `
            <p>${advice.summary || "Great job completing your exercise session!"}</p>
            ${
              advice.tips && advice.tips.length > 0
                ? `
                <ul>
                    ${advice.tips.map((tip) => `<li>${tip}</li>`).join("")}
                </ul>
            `
                : ""
            }
        `
  } catch (error) {
    console.error("Error loading AI advice:", error)

    // Fallback advice based on performance
    const accuracy = summaryData.accuracy || 0
    let fallbackAdvice = ""

    if (accuracy >= 80) {
      fallbackAdvice = `
                <p>Excellent work! Your form accuracy of ${accuracy}% shows great control and technique.</p>
                <ul>
                    <li>Continue with your current routine to maintain progress</li>
                    <li>Consider increasing repetitions gradually</li>
                    <li>Stay hydrated and maintain proper rest between sessions</li>
                </ul>
            `
    } else if (accuracy >= 50) {
      fallbackAdvice = `
                <p>Good effort! Your ${accuracy}% accuracy shows room for improvement.</p>
                <ul>
                    <li>Focus on slower, more controlled movements</li>
                    <li>Watch tutorial videos for proper form guidance</li>
                    <li>Practice in front of a mirror to self-correct</li>
                </ul>
            `
    } else {
      fallbackAdvice = `
                <p>Keep practicing! Every session helps build muscle memory and improve form.</p>
                <ul>
                    <li>Start with fewer repetitions and focus on quality</li>
                    <li>Consider consulting with a physiotherapist</li>
                    <li>Warm up properly before each session</li>
                </ul>
            `
    }

    adviceContainer.innerHTML = fallbackAdvice
  }
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
