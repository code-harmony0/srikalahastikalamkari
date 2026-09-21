"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth"
import { auth, initAppCheckOnDemand } from "../config/firebase"
import { useUserProfileStore } from "../user-profile-store"
import { useWishlistStore } from "../wishlist-store"
import { useCartStore } from "../cart-store"


type AuthContextType = {
  user: FirebaseUser | null
  loading: boolean
  role?: string | null
  signUp: (email: string, password: string) => Promise<UserCredential>
  signIn: (email: string, password: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithEmailOTP: (email: string) => Promise<{ error: any }>
  verifyEmailOTP: (email: string, otp: string) => Promise<{ error: any }>
  signInWithPhone: (phoneNumber: string, recaptchaContainer: string) => Promise<{ error?: any }>
  verifyPhoneOTP: (otp: string) => Promise<{ error?: any; user?: FirebaseUser }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const googleProvider = new GoogleAuthProvider()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const currentUid = firebaseUser?.uid || null

      if (!currentUid) {
        // User signed out — wipe all user-specific local data
        useUserProfileStore.getState().resetForUser("")
        useWishlistStore.getState().clearWishlist()
        useCartStore.getState().clearCart()
      } else {
        // User signed in — check if it's a different user from what's stored
        const storedOwnerId = useUserProfileStore.getState().profile._ownerId
        if (!storedOwnerId || storedOwnerId !== currentUid) {
          // Different user (or first login) — clear previous user's data
          useUserProfileStore.getState().resetForUser(currentUid)
          useWishlistStore.getState().clearWishlist()
          useCartStore.getState().clearCart()
        }
      }

      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider)
  }

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email)
  }

  const signOut = () => {
    return firebaseSignOut(auth)
  }

  const logout = () => {
    return firebaseSignOut(auth)
  }

  const signInWithEmailOTP = async (email: string) => {
    // TODO: Implement OTP authentication
    console.log("OTP authentication not yet implemented")
    return { error: { message: "OTP authentication not implemented" } }
  }

  const verifyEmailOTP = async (email: string, otp: string) => {
    // TODO: Implement OTP verification
    console.log("OTP verification not yet implemented")
    return { error: { message: "OTP verification not implemented" } }
  }

  // Phone Authentication with OTP
  const signInWithPhone = async (phoneNumber: string, recaptchaContainer: string) => {
    try {
      // In development mode, provide a reliable dev auth flow
      // (avoids reCAPTCHA domain mismatch and Firebase AppCheck failures on localhost)
      if (process.env.NODE_ENV === "development") {
        setConfirmationResult({
          verificationId: "dev-verification-id",
          confirm: async (_otpCode: string) => {
            const res = await signInWithEmailAndPassword(
              auth,
              "dev-test-kalamkari@example.com",
              "DevPassword123!"
            )
            try {
              useUserProfileStore.getState().updateProfile({
                phone: phoneNumber,
                name: "Dev User",
              })
            } catch (_) {}
            setUser(res.user)
            return { user: res.user }
          },
        } as any)
        return { error: null }
      }

      // Init App Check on first phone auth attempt (deferred from page load)
      await initAppCheckOnDemand()

      // Destroy any existing verifier to prevent "reCAPTCHA has already been rendered" error
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear() } catch (_) {}
        (window as any).recaptchaVerifier = null
      }

      // Clear and reset the container DOM node
      const container = document.getElementById(recaptchaContainer)
      if (container) container.innerHTML = ""

      // Create a fresh invisible verifier
      const verifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: "invisible",
        callback: () => {}, // no-op; required for invisible reCAPTCHA
      })

      // Fully render the verifier before proceeding — prevents first-attempt failures
      await verifier.render()
      ;(window as any).recaptchaVerifier = verifier

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      setConfirmationResult(confirmation)
      return { error: null }
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      // Always clean up on failure so the next attempt starts fresh
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear() } catch (_) {}
        (window as any).recaptchaVerifier = null
      }
      const container = document.getElementById(recaptchaContainer)
      if (container) container.innerHTML = ""
      return { error }
    }
  }

  // Verify OTP code
  const verifyPhoneOTP = async (otp: string) => {
    try {
      if (!confirmationResult) {
        return { error: { message: "No confirmation result. Please request OTP first." } }
      }

      const result = await confirmationResult.confirm(otp)
      setUser(result.user)
      return { user: result.user, error: null }
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      return { error }
    }
  }

  const value = {
    user,
    loading,
    role: null,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    signOut,
    logout,
    signInWithEmailOTP,
    verifyEmailOTP,
    signInWithPhone,
    verifyPhoneOTP,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
