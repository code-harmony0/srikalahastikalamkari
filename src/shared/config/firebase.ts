import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

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

// Initialize Firebase Auth
const auth = getAuth(app)

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
