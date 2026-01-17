// Live exercise page functionality
// Wrapped in an IIFE so variables don't conflict if the script is injected twice.

;(function () {
  let webcamManager = null
  let analysisInterval = null
  let timerInterval = null
  let analysisLoopActive = false
  let analysisInFlight = false
  let lastAnalysisTs = 0
  const ANALYSIS_INTERVAL_MS = 350

  let adviceInterval = null
  let adviceInFlight = false
  let lastAdviceTs = 0
  const ADVICE_INTERVAL_MS = 8000
  let lastLiveFeedbackMessage = ""
  let lastAiAdviceMessage = ""
  const sessionData = {
    exerciseType: "",
    startTime: null,
    correctReps: 0,
    incorrectReps: 0,
    totalFrames: 0,
    confidenceSum: 0,
    mistakeCounts: {},
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
  document.getElementById("exercise-title").textContent = `Remote Rehab Session: ${formatExerciseName(exerciseType)}`

  const videoElement = document.getElementById("webcam")
  const canvasElement = document.getElementById("overlay-canvas")
  webcamManager = new WebcamManager(videoElement, canvasElement)

  // Set up MediaPipe results callback
  webcamManager.setOnResults((results) => {
    if (results.poseLandmarks && webcamManager.isActive) {
      // Extract landmarks for backend prediction
      handleMediaPipeResults(results)
    }
  })

  setupControls()

  // Auto-start camera for squats exercise
  if (exerciseType === "squats") {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      startCamera()
    }, 500)
  }
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
  analysisLoopActive = true
  analysisInFlight = false
  lastAnalysisTs = 0

  const loop = async (ts) => {
    if (!analysisLoopActive) return

    if (webcamManager && webcamManager.isActive) {
      if (!analysisInFlight && ts - lastAnalysisTs >= ANALYSIS_INTERVAL_MS) {
        const frameData = webcamManager.captureFrame()
        if (frameData) {
          analysisInFlight = true
          lastAnalysisTs = ts
          try {
            const result = await analyzePose(frameData, sessionData.exerciseType)
            handleAnalysisResult(result)
          } catch (error) {
            console.error("Analysis error:", error)
          } finally {
            analysisInFlight = false
          }
        }
      }
    }

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
  startLiveAdvice()
}

function handleMediaPipeResults(results) {
  // This function is called when MediaPipe detects pose landmarks
  // The pose visualization is already handled by MediaPipe in webcam.js
  // We can use this for additional processing if needed
  // The actual prediction is done by sending frames to the backend API
}

function drawBackendPoseOverlay(keypoints) {
  // Draw pose overlay from backend keypoints
  // This provides visualization even if MediaPipe JavaScript doesn't load
  if (!webcamManager || !webcamManager.ctx) return

  const ctx = webcamManager.ctx
  const canvas = webcamManager.canvas

  // Clear overlay only (video is shown by <video>; avoid redrawing the full frame here)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw keypoints
  ctx.strokeStyle = "#00FF00"
  ctx.lineWidth = 2
  ctx.fillStyle = "#FF0000"

  // Draw connections between keypoints (simplified pose skeleton)
  const connections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
  ]

  connections.forEach(([start, end]) => {
    if (keypoints[start] && keypoints[end] && keypoints[start].score > 0.3 && keypoints[end].score > 0.3) {
      ctx.beginPath()
      ctx.moveTo(keypoints[start].x, keypoints[start].y)
      ctx.lineTo(keypoints[end].x, keypoints[end].y)
      ctx.stroke()
    }
  })

  // Draw landmarks
  keypoints.forEach((point) => {
    if (point.score > 0.3) {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  })
}

function stopAnalysis() {
  analysisLoopActive = false
  analysisInFlight = false
  if (analysisInterval) {
    clearInterval(analysisInterval)
    analysisInterval = null
  }
  stopLiveAdvice()
}

function startLiveAdvice() {
  const adviceContainer = document.getElementById("feedback-text")
  if (!adviceContainer) return

  if (adviceInterval) {
    clearInterval(adviceInterval)
  }

  adviceInFlight = false
  lastAdviceTs = 0

  adviceInterval = setInterval(async () => {
    if (!webcamManager || !webcamManager.isActive) return

    const now = Date.now()
    if (adviceInFlight || now - lastAdviceTs < ADVICE_INTERVAL_MS) return

    const duration = sessionData.startTime ? Math.floor((Date.now() - sessionData.startTime) / 1000) : 0
    const totalReps = sessionData.correctReps + sessionData.incorrectReps
    const accuracy = totalReps > 0 ? Math.round((sessionData.correctReps / totalReps) * 100) : 0
    const avgConfidence =
      sessionData.totalFrames > 0 ? Math.round((sessionData.confidenceSum / sessionData.totalFrames) * 100) : 0

    const payload = {
      exerciseType: sessionData.exerciseType,
      duration: duration,
      correctReps: sessionData.correctReps,
      incorrectReps: sessionData.incorrectReps,
      accuracy: accuracy,
      avgConfidence: avgConfidence,
      date: new Date().toISOString(),
    }

    adviceInFlight = true
    lastAdviceTs = now
    try {
      const advice = await getAIAdvice(payload)
      if (advice && advice.summary) {
        const tips = Array.isArray(advice.tips) ? advice.tips : []
        const tipsText = tips.length ? ` ${tips.slice(0, 2).join(" • ")}` : ""
        lastAiAdviceMessage = `AI: ${advice.summary}${tipsText}`
        renderFeedback()
      }
    } catch (error) {
      // Silent fail: AI advice shouldn't break the live loop
    } finally {
      adviceInFlight = false
    }
  }, 2000)
}

function stopLiveAdvice() {
  adviceInFlight = false
  if (adviceInterval) {
    clearInterval(adviceInterval)
    adviceInterval = null
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

    if (result.feedback) {
      recordMistake(result.feedback)
    }
  }

  renderRiskBadge(getRiskFlag())

  // Update confidence meter
  const confidence = Math.round((result.confidence || 0) * 100)
  document.getElementById("confidence-fill").style.width = `${confidence}%`
  document.getElementById("confidence-value").textContent = `${confidence}%`

  // Update exercise status badge
  const statusBadge = document.querySelector("#exercise-status .status-badge")
  statusBadge.className = `status-badge ${result.status}`
  statusBadge.innerHTML = `<span>${result.status === "correct" ? "Correct Form" : result.status === "incorrect" ? "Incorrect Form" : "Analyzing..."}</span>`

  // Update feedback text
  lastLiveFeedbackMessage = result.feedback || "Keep going!"
  renderFeedback()

  // Draw pose overlay if keypoints available from backend and MediaPipe isn't active
  // MediaPipe draws in real-time; backend keypoints are a fallback.
  const mediaPipeActive = Boolean(webcamManager && webcamManager.pose)
  if (!mediaPipeActive && result.keypoints && result.keypoints.length > 0) {
    drawBackendPoseOverlay(result.keypoints)
  }
}

function recordMistake(message) {
  const normalized = normalizeMistakeMessage(message)
  if (!normalized) return
  sessionData.mistakeCounts[normalized] = (sessionData.mistakeCounts[normalized] || 0) + 1
}

function normalizeMistakeMessage(message) {
  if (!message || typeof message !== "string") return ""
  const trimmed = message.trim()
  if (!trimmed) return ""
  const firstLine = trimmed.split("\n")[0]
  const limited = firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine
  return limited
}

function getTopMistakes(limit = 3) {
  const entries = Object.entries(sessionData.mistakeCounts || {})
  entries.sort((a, b) => b[1] - a[1])
  return entries.slice(0, limit).map(([msg]) => msg)
}

function getRiskFlag() {
  const totalReps = sessionData.correctReps + sessionData.incorrectReps
  if (totalReps < 5) {
    return {
      level: "normal",
      label: "Normal",
      explanation: "No risk flags detected.",
    }
  }

  const incorrectRate = totalReps > 0 ? sessionData.incorrectReps / totalReps : 0
  if (incorrectRate >= 0.5) {
    return {
      level: "high-risk",
      label: "High Risk",
      explanation: "Session flagged for therapist attention.",
    }
  }

  if (incorrectRate >= 0.3) {
    return {
      level: "needs-review",
      label: "Needs Review",
      explanation: "Session flagged for therapist attention.",
    }
  }

  return {
    level: "normal",
    label: "Normal",
    explanation: "No risk flags detected.",
  }
}

function renderRiskBadge(risk) {
  const badge = document.getElementById("risk-badge")
  if (!badge || !risk) return
  badge.className = `risk-badge ${risk.level}`
  badge.textContent = risk.label
}

function renderFeedback() {
  const feedbackText = document.getElementById("feedback-text")
  if (!feedbackText) return

  const live = lastLiveFeedbackMessage || "Start the camera to begin exercise analysis"
  const ai = lastAiAdviceMessage
  feedbackText.innerHTML = ai ? `<p>${live}</p><p>${ai}</p>` : `<p>${live}</p>`
}

function updateFeedback(message, status) {
  lastLiveFeedbackMessage = message
  renderFeedback()
}

async function endSession() {
  stopCamera()

  const duration = sessionData.startTime ? Math.floor((Date.now() - sessionData.startTime) / 1000) : 0
  const totalReps = sessionData.correctReps + sessionData.incorrectReps
  const accuracy = totalReps > 0 ? Math.round((sessionData.correctReps / totalReps) * 100) : 0
  const incorrectPercentage = totalReps > 0 ? Math.max(0, 100 - accuracy) : 0
  const avgConfidence =
    sessionData.totalFrames > 0 ? Math.round((sessionData.confidenceSum / sessionData.totalFrames) * 100) : 0

  const risk = getRiskFlag()

  let recoveryRecommendation = "Continue with steady, controlled movement and follow your prescribed plan."
  if (accuracy >= 80) {
    recoveryRecommendation = "Good rehab quality. Continue with the current plan and increase reps gradually if pain-free."
  } else if (accuracy >= 50) {
    recoveryRecommendation = "Moderate rehab quality. Slow down, focus on form, and consider a therapist review for technique."
  } else {
    recoveryRecommendation = "Low rehab quality. Pause progression and request therapist review before increasing intensity."
  }

  // Prepare summary data
  const summaryData = {
    exerciseType: sessionData.exerciseType,
    duration: duration,
    postureChecks: sessionData.totalFrames,
    correctReps: sessionData.correctReps,
    incorrectReps: sessionData.incorrectReps,
    accuracy: accuracy,
    correctPercentage: accuracy,
    incorrectPercentage: incorrectPercentage,
    avgConfidence: avgConfidence,
    commonMistakes: getTopMistakes(3),
    riskLevel: risk.level,
    riskLabel: risk.label,
    riskExplanation: risk.explanation,
    recoveryRecommendation: recoveryRecommendation,
    date: new Date().toISOString(),
  }

  // Store in session storage for summary page
  sessionStorage.setItem("sessionSummary", JSON.stringify(summaryData))

  // Save to backend
  try {
    const backendPayload = {
      exerciseType: summaryData.exerciseType,
      duration: summaryData.duration,
      correctReps: summaryData.correctReps,
      incorrectReps: summaryData.incorrectReps,
      accuracy: summaryData.accuracy,
      avgConfidence: summaryData.avgConfidence,
      date: summaryData.date,
    }
    await saveSession(backendPayload)
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
