// Exercise selection page functionality

// This page lets the user pick an exercise. We require authentication,
// hook up the navbar, then wire each card to save the selection and
// send the user to the reference page for that exercise.

document.addEventListener("DOMContentLoaded", () => {
  requireAuth((user) => {
    setupNavigation(user)
    setupExerciseCards()
  })
})

function setupExerciseCards() {
  const exerciseCards = document.querySelectorAll(".exercise-card")

  exerciseCards.forEach((card) => {
    const btn = card.querySelector(".start-exercise-btn")
    const exerciseType = card.dataset.exercise

    if (!btn || !exerciseType) return

    btn.addEventListener("click", () => {
      // Store selected exercise in session storage so reference/live pages can use it
      sessionStorage.setItem("selectedExercise", exerciseType)
      // First show the reference page with video and tips
      window.location.href = "reference.html"
    })
  })
}
