// Live exercise page functionality
// Wrapped in an IIFE so variables don't conflict if the script is injected twice.

;(function () {
  let webcamManager = null
  let analysisInterval = null
  let timerInterval = null
  const sessionData = {
    exerciseType: "",
    startTime: null,
    correctReps: 0,
    incorrectReps: 0,
    totalFrames: 0,
    confidenceSum: 0,
  }

  // NOTE:
  // - requireAuth, setupNavigation come from auth.js
  // - WebcamManager comes from webcam.js
  // - analyzePose, saveSession come from api.js
  document.addEventListener("DOMContentLoaded", () => {
    requireAuth((user) => {
      setupNavigation(user)
      initializeLivePage()
    })
  })

  function initializeLivePage() {
  const exerciseType = sessionStorage.getItem("selectedExercise")

  if (!exerciseType) {
    window.location.href = "exercise.html"
    return
  }

  sessionData.exerciseType = exerciseType
  document.getElementById("exercise-title").textContent = formatExerciseName(exerciseType)

  const videoElement = document.getElementById("webcam")
  const canvasElement = document.getElementById("overlay-canvas")
  webcamManager = new WebcamManager(videoElement, canvasElement)

  setupControls()
}

function setupControls() {
  const startBtn = document.getElementById("start-camera-btn")
  const stopBtn = document.getElementById("stop-camera-btn")
  const endBtn = document.getElementById("end-session-btn")

  startBtn.addEventListener("click", startCamera)
  stopBtn.addEventListener("click", stopCamera)
  endBtn.addEventListener("click", endSession)
}

async function startCamera() {
  const startBtn = document.getElementById("start-camera-btn")
  const stopBtn = document.getElementById("stop-camera-btn")
  const statusElement = document.getElementById("webcam-status")

  try {
    startBtn.disabled = true
    startBtn.innerHTML =
      '<svg class="spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"></circle></svg> Starting...'

    await webcamManager.start()

    statusElement.classList.add("hidden")
    startBtn.style.display = "none"
    stopBtn.disabled = false

    // Start session timer
    sessionData.startTime = Date.now()
    startTimer()

    // Start pose analysis
    startAnalysis()

    updateFeedback("Camera started. Begin your exercise!", "waiting")
  } catch (error) {
    startBtn.disabled = false
    startBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Start Camera'
    updateFeedback("Failed to access camera. Please allow camera permissions.", "error")
  }
}

function stopCamera() {
  const startBtn = document.getElementById("start-camera-btn")
  const stopBtn = document.getElementById("stop-camera-btn")
  const statusElement = document.getElementById("webcam-status")

  webcamManager.stop()
  stopAnalysis()
  stopTimer()

  statusElement.classList.remove("hidden")
  startBtn.style.display = "flex"
  startBtn.disabled = false
  startBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Start Camera'
  stopBtn.disabled = true

  updateFeedback("Camera stopped. Click Start Camera to resume.", "waiting")
}

function startTimer() {
  const timerElement = document.getElementById("timer")

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionData.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, "0")
    const seconds = (elapsed % 60).toString().padStart(2, "0")
    timerElement.textContent = `${minutes}:${seconds}`
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function startAnalysis() {
  // Capture and analyze frames every 500ms
  analysisInterval = setInterval(async () => {
    if (!webcamManager.isActive) return

    const frameData = webcamManager.captureFrame()
    if (!frameData) return

    try {
      const result = await analyzePose(frameData, sessionData.exerciseType)
      handleAnalysisResult(result)
    } catch (error) {
      console.error("Analysis error:", error)
    }
  }, 500)
}

function stopAnalysis() {
  if (analysisInterval) {
    clearInterval(analysisInterval)
    analysisInterval = null
  }
}

function handleAnalysisResult(result) {
  sessionData.totalFrames++
  sessionData.confidenceSum += result.confidence || 0

  // Update pose status
  const poseStatus = document.getElementById("pose-status")
  const indicator = poseStatus.querySelector(".status-indicator")
  const statusText = poseStatus.querySelector(".status-text")

  if (result.status === "correct") {
    indicator.className = "status-indicator correct"
    statusText.textContent = "Correct Form"

    if (result.repCompleted) {
      sessionData.correctReps++
      document.getElementById("correct-reps").textContent = sessionData.correctReps
    }
  } else if (result.status === "incorrect") {
    indicator.className = "status-indicator incorrect"
    statusText.textContent = "Adjust Form"

    if (result.repCompleted) {
      sessionData.incorrectReps++
      document.getElementById("incorrect-reps").textContent = sessionData.incorrectReps
    }
  }

  // Update confidence meter
  const confidence = Math.round((result.confidence || 0) * 100)
  document.getElementById("confidence-fill").style.width = `${confidence}%`
  document.getElementById("confidence-value").textContent = `${confidence}%`

  // Update exercise status badge
  const statusBadge = document.querySelector("#exercise-status .status-badge")
  statusBadge.className = `status-badge ${result.status}`
  statusBadge.innerHTML = `<span>${result.status === "correct" ? "Correct Form" : result.status === "incorrect" ? "Incorrect Form" : "Analyzing..."}</span>`

  // Update feedback text
  updateFeedback(result.feedback || "Keep going!", result.status)

  // Draw pose overlay if keypoints available
  if (result.keypoints) {
    webcamManager.drawPoseOverlay(result.keypoints)
  }
}

function updateFeedback(message, status) {
  const feedbackText = document.getElementById("feedback-text")
  feedbackText.innerHTML = `<p>${message}</p>`
}

async function endSession() {
  stopCamera()

  const duration = sessionData.startTime ? Math.floor((Date.now() - sessionData.startTime) / 1000) : 0
  const totalReps = sessionData.correctReps + sessionData.incorrectReps
  const accuracy = totalReps > 0 ? Math.round((sessionData.correctReps / totalReps) * 100) : 0
  const avgConfidence =
    sessionData.totalFrames > 0 ? Math.round((sessionData.confidenceSum / sessionData.totalFrames) * 100) : 0

  // Prepare summary data
  const summaryData = {
    exerciseType: sessionData.exerciseType,
    duration: duration,
    correctReps: sessionData.correctReps,
    incorrectReps: sessionData.incorrectReps,
    accuracy: accuracy,
    avgConfidence: avgConfidence,
    date: new Date().toISOString(),
  }

  // Store in session storage for summary page
  sessionStorage.setItem("sessionSummary", JSON.stringify(summaryData))

  // Save to backend
  try {
    await saveSession(summaryData)
  } catch (error) {
    console.error("Error saving session:", error)
  }

  // Navigate to summary
  window.location.href = "summary.html"
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

})();
