// Authentication functions using Firebase Auth

const firebase = window.firebase // Declare the firebase variable

function getAuth() {
  return firebase.auth()
}

async function loginUser(email, password) {
  const auth = getAuth()
  return auth.signInWithEmailAndPassword(email, password)
}

async function signupUser(email, password) {
  const auth = getAuth()
  return auth.createUserWithEmailAndPassword(email, password)
}

async function logoutUser() {
  const auth = getAuth()
  return auth.signOut()
}

function getCurrentUser() {
  const auth = getAuth()
  return auth.currentUser
}

function onAuthStateChange(callback) {
  const auth = getAuth()
  return auth.onAuthStateChanged(callback)
}

async function getIdToken() {
  const user = getCurrentUser()
  if (user) {
    return user.getIdToken()
  }
  return null
}

function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already registered. Please login instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Email/password accounts are not enabled.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
  }
  return errorMessages[errorCode] || "An error occurred. Please try again."
}

// Protected page check
function requireAuth(callback) {
  onAuthStateChange((user) => {
    if (!user) {
      window.location.href = "login.html"
    } else {
      if (callback) callback(user)
    }
  })
}

// Setup common navigation elements
function setupNavigation(user) {
  // Display user email
  const userEmailElements = document.querySelectorAll("#user-email")
  userEmailElements.forEach((el) => {
    if (el) el.textContent = user.email
  })

  // Setup logout buttons
  const logoutBtns = document.querySelectorAll("#logout-btn, #mobile-logout-btn")
  logoutBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", async () => {
        await logoutUser()
        window.location.href = "login.html"
      })
    }
  })

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const mobileNav = document.getElementById("mobile-nav")
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("active")
    })
  }
}
