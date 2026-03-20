import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check"

// Inject App Check debug token only in local development (bypasses reCAPTCHA Enterprise)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true
}

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

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize App Check with reCAPTCHA Enterprise (only in browser)
if (typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("6LdHaY4sAAAAABqgqjuTAclT4QFfmnJ2IJ5KgY4z"),
    isTokenAutoRefreshEnabled: true,
  })
}

// Initialize Firebase Auth
const auth = getAuth(app)

// Bypass reCAPTCHA verification in development (use test phone numbers only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  auth.settings.appVerificationDisabledForTesting = true
}

// Initialize Analytics (only in browser environment)
let analytics
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

export { auth, analytics }
export default app
