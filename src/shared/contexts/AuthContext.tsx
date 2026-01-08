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
import { auth } from "../config/firebase"

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
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
      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again
          console.log('reCAPTCHA expired')
        }
      })

      // Send OTP to phone number
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      setConfirmationResult(confirmation)

      return { error: null }
    } catch (error: any) {
      console.error("Error sending OTP:", error)
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
