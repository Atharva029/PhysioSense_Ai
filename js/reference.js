// Exercise reference page
// Shows a demo video and form tips for the exercise selected on exercise.html

document.addEventListener("DOMContentLoaded", () => {
  requireAuth((user) => {
    setupNavigation(user)
    initReferencePage()
  })
})

function initReferencePage() {
  const exerciseType = sessionStorage.getItem("selectedExercise")

  // If no exercise has been selected, send the user back to the selection page.
  if (!exerciseType) {
    window.location.href = "exercise.html"
    return
  }

  const prettyName = formatExerciseName(exerciseType)

  const titleEl = document.getElementById("exercise-title")
  const subtitleEl = document.getElementById("exercise-subtitle")

  if (titleEl) titleEl.textContent = prettyName
  if (subtitleEl) {
    subtitleEl.textContent = `Review the correct form for ${prettyName} before starting your live session.`
  }

  loadReferenceContent(exerciseType)

  // Start live exercise
  const startLiveBtn = document.getElementById("start-live-btn")
  if (startLiveBtn) {
    startLiveBtn.addEventListener("click", () => {
      window.location.href = "live.html"
    })
  }

  // Go back to exercise selection
  const changeBtn = document.getElementById("change-exercise-btn")
  if (changeBtn) {
    changeBtn.addEventListener("click", () => {
      window.location.href = "exercise.html"
    })
  }
}

function loadReferenceContent(type) {
  const videoMap = {
    "shoulder-abduction": "videos/shoulder-abduction.mp4",
    "knee-flexion": "videos/knee-flexion.mp4",
    "arm-raise": "videos/arm-raise.mp4",
    squats: "videos/squats.mp4",
  }

  const tipsMap = {
    "shoulder-abduction": [
      "Stand upright with your feet hip-width apart and arms relaxed by your side.",
      "Lift both arms slowly out to the side until they reach shoulder height.",
      "Keep your elbows straight but not locked; avoid shrugging your shoulders.",
      "Pause briefly at the top, then lower your arms in a controlled motion.",
      "Maintain steady breathing throughout the movement.",
    ],
    "knee-flexion": [
      "Stand tall, holding onto a stable surface for support if needed.",
      "Shift your weight to the standing leg, then bend the other knee backward slowly.",
      "Keep your thighs aligned; avoid letting the knee drift outward.",
      "Lift only as far as is comfortable and pain-free.",
      "Return your foot to the floor in a smooth, controlled motion.",
    ],
    "arm-raise": [
      "Stand or sit upright with shoulders relaxed and arms by your sides.",
      "Raise your arms forward to shoulder height with palms facing down.",
      "Avoid arching your back or shrugging your shoulders upward.",
      "Move in a slow, controlled manner; do not swing the arms.",
      "Lower your arms gently back to the starting position.",
    ],
    squats: [
      "Stand with your feet shoulder-width apart and toes slightly turned out.",
      "Keep your chest upright and core engaged throughout the movement.",
      "Bend at the hips and knees as if sitting back into a chair.",
      "Do not let your knees move far past your toes; track them over your mid-foot.",
      "Press through your heels to stand back up, squeezing your glutes at the top.",
    ],
  }

  const videoSrc = videoMap[type]
  const tips = tipsMap[type]

  const videoSourceEl = document.getElementById("video-source")
  const videoEl = document.getElementById("reference-video")
  const tipsList = document.getElementById("exercise-tips")
  const videoCaptionEl = document.getElementById("video-caption")

  // Fallback if an unknown exercise type slips through
  if (!videoSrc || !tips) {
    if (videoCaptionEl) {
      videoCaptionEl.textContent = "Reference video not available for this exercise."
    }
    if (tipsList) {
      tipsList.innerHTML = ""
      const li = document.createElement("li")
      li.textContent = "Please go back and select a supported exercise."
      tipsList.appendChild(li)
    }
    return
  }

  if (videoSourceEl && videoEl) {
    videoSourceEl.src = videoSrc
    videoEl.load()
  }

  if (tipsList) {
    tipsList.innerHTML = ""
    tips.forEach((tip) => {
      const li = document.createElement("li")
      li.textContent = tip
      tipsList.appendChild(li)
    })
  }
}

function formatExerciseName(type) {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
