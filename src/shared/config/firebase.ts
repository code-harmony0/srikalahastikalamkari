import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjuSNZKDjaFZoi_ny8e7p3vpE3EBkNuFo",
  authDomain: "shri-kailash-kalamkari.firebaseapp.com",
  projectId: "shri-kailash-kalamkari",
  storageBucket: "shri-kailash-kalamkari.firebasestorage.app",
  messagingSenderId: "151505278104",
  appId: "1:151505278104:web:fb8c6216a64f1a05fdaced",
  measurementId: "G-CWYLNNEFH3",
}

// Initialize Firebase app (lightweight — no external scripts yet)
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
const auth = getAuth(app)

// Development: bypass reCAPTCHA so test phone numbers work
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  auth.settings.appVerificationDisabledForTesting = true
}

// App Check — deferred until first auth action so it doesn't block page load
// Called lazily from AuthContext when user interacts with phone login
let appCheckInitialized = false
export async function initAppCheckOnDemand() {
  if (appCheckInitialized || typeof window === "undefined") return
  appCheckInitialized = true

  if (process.env.NODE_ENV === "development") {
    ;(window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }

  try {
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import("firebase/app-check")
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider("6LdHaY4sAAAAABqgqjuTAclT4QFfmnJ2IJ5KgY4z"),
      isTokenAutoRefreshEnabled: true,
    })
  } catch (error) {
    console.warn("Firebase App Check failed to initialize:", error)
  }
}

// Analytics — deferred until after page is interactive (non-blocking)
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(async () => {
      try {
        const { getAnalytics, isSupported } = await import("firebase/analytics")
        const supported = await isSupported()
        if (supported) getAnalytics(app)
      } catch (error) {
        console.warn("Firebase Analytics failed to load:", error)
      }
    }, 3000) // 3s after load — well after LCP/FID are measured
  })
}

export { auth }
export default app
