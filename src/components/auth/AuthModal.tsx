"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  User,
  ShieldCheck,
  X,
} from "lucide-react"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useAuthModalStore } from "@/shared/auth-modal-store"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { toast } from "sonner"
import OtpInput from "react-otp-input"

export function AuthModal() {
  const { isOpen, closeModal, redirectUrl } = useAuthModalStore()
  const { user, signInWithPhone, verifyPhoneOTP } = useAuth()
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Timer Logic for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Reset modal state when closed or user changes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber("")
      setOtp("")
      setStep("phone")
      setLoading(false)
      setResendTimer(0)
    }
  }, [isOpen])

  // If user becomes authenticated while modal is open, close it
  useEffect(() => {
    if (user && isOpen) {
      closeModal()
      if (redirectUrl) {
        router.push(redirectUrl)
      }
    }
  }, [user, isOpen, redirectUrl, closeModal, router])

  // Cleanup RecaptchaVerifier on unmount (AuthContext manages this via window.recaptchaVerifier)
  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          ;(window as any).recaptchaVerifier.clear()
        } catch (e) {
          console.error("Failed to clear recaptcha verifier on modal unmount:", e)
        }
        ;(window as any).recaptchaVerifier = null
      }
    }
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = phoneNumber.replace(/\D/g, "")

    if (cleaned.length !== 10) {
      toast.error("Invalid Phone Number", {
        description: "Please enter a valid 10-digit Indian mobile number.",
      })
      return
    }

    setLoading(true)
    const formattedPhone = "+91" + cleaned
    
    const { error } = await signInWithPhone(
      formattedPhone,
      "auth-modal-recaptcha",
    )
    setLoading(false)

    if (error) {
      toast.error("Failed to send OTP", { description: error.message })
    } else {
      setStep("otp")
      setResendTimer(30)
      toast.success("Verification Code Sent", {
        description:
          process.env.NODE_ENV === "development"
            ? `Code sent to +91 ${cleaned} (Dev OTP: 123456)`
            : `Code sent to +91 ${cleaned}`,
      })
    }
  }

  const handleQuickDevLogin = async () => {
    setLoading(true)
    try {
      const cleaned = phoneNumber.replace(/\D/g, "")
      const formattedPhone = cleaned.length === 10 ? "+91" + cleaned : "+919876543210"
      await signInWithPhone(formattedPhone, "auth-modal-recaptcha")
      const { error } = await verifyPhoneOTP("123456")
      if (error) {
        toast.error("Dev Sign In Failed", { description: error.message })
      } else {
        toast.success("Welcome Back (Dev Mode)", { description: "Successfully logged in." })
        closeModal()
        if (redirectUrl) {
          router.push(redirectUrl)
        }
      }
    } catch (err: any) {
      toast.error("Dev Sign In Error", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalOtp = otp || (process.env.NODE_ENV === "development" ? "123456" : "")
    if (finalOtp.length !== 6) return

    setLoading(true)
    const { error } = await verifyPhoneOTP(finalOtp)
    setLoading(false)

    if (error) {
      toast.error("Verification Failed", {
        description: "Invalid code. Please try again.",
      })
    } else {
      toast.success("Welcome Back!", { description: "Successfully logged in." })
      closeModal()
      if (redirectUrl) {
        router.push(redirectUrl)
      }
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    const cleaned = phoneNumber.replace(/\D/g, "")
    const formattedPhone = "+91" + cleaned

    setLoading(true)
    const { error } = await signInWithPhone(
      formattedPhone,
      "auth-modal-recaptcha",
    )
    setLoading(false)

    if (!error) {
      setResendTimer(30)
      setOtp("")
      toast.success("Code Resent", { description: "A new code has been sent." })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent aria-describedby="auth-modal-desc" className="auth-modal-dialog sm:max-w-[420px] p-0 bg-white rounded-[14px] border border-[hsl(var(--brand-gold)/0.3)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden [&>button]:hidden">
        {/* Invisible ReCAPTCHA Container — must match the ID passed to signInWithPhone */}
        <div id="auth-modal-recaptcha"></div>

        {/* Modal Header */}
        <div className="relative pt-10 px-8 pb-6 text-center">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full text-[hsl(var(--brand-muted))] hover:text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.05)] transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-[hsl(var(--brand-indigo-tint))] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[hsl(var(--brand-ink)/0.1)] border border-[hsl(var(--brand-gold)/0.3)]">
            <User className="w-7 h-7 text-[hsl(var(--brand-ink))]" />
          </div>

          <DialogTitle className="font-playfair text-2xl md:text-3xl font-bold text-[hsl(var(--brand-ink))] mb-2">
            {step === "phone" ? "Sign In" : "Verify Phone"}
          </DialogTitle>
          <DialogDescription id="auth-modal-desc" className="font-inter text-[hsl(var(--brand-ink-soft))] text-sm md:text-base">
            {step === "phone"
              ? "Enter your mobile number to continue."
              : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
          </DialogDescription>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-10">
          <AnimatePresence mode="wait">
            {/* STEP 1: Phone Number */}
            {step === "phone" ? (
              <motion.form
                key="phone-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[hsl(var(--brand-ink-soft))] font-medium border-r border-[hsl(var(--brand-gold)/0.2)] pr-3">
                    <Phone className="w-4 h-4" /> <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      if (val.length <= 10) setPhoneNumber(val)
                    }}
                    className="w-full pl-24 pr-4 py-3.5 bg-[hsl(var(--brand-paper)/0.3)] border border-[hsl(var(--brand-gold)/0.2)] rounded-[8px] focus:outline-none focus:border-[hsl(var(--brand-gold))] focus:ring-1 focus:ring-[hsl(var(--brand-gold)/0.4)] transition-all font-inter text-lg text-[hsl(var(--brand-ink))] tracking-wide placeholder:text-[hsl(var(--brand-ink)/0.2)]"
                    placeholder="98765 43210"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full py-3.5 bg-[hsl(var(--brand-midnight))] text-white rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest hover:bg-[hsl(var(--brand-midnight-hover))] shadow-[0_4px_12px_rgba(14,34,64,0.15)] hover:shadow-[0_6px_16px_rgba(14,34,64,0.25)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                {process.env.NODE_ENV === "development" && (
                  <button
                    type="button"
                    onClick={handleQuickDevLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-amber-50 border border-dashed border-amber-300 text-amber-900 rounded-[8px] font-mono text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Dev Quick Sign In (Skip OTP for Testing)</span>
                  </button>
                )}
              </motion.form>
            ) : (
              /* STEP 2: OTP Entry */
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-8"
              >
                {process.env.NODE_ENV === "development" && (
                  <p className="text-center font-mono text-xs text-amber-800 bg-amber-50 py-1.5 px-3 rounded border border-amber-200">
                    Dev Mode: Enter <strong>123456</strong> to sign in
                  </p>
                )}
                <div className="flex justify-center">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="w-2" />}
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="!w-10 !h-12 sm:!w-12 sm:!h-14 border border-[hsl(var(--brand-gold)/0.2)] rounded-[8px] text-center text-xl font-bold bg-[hsl(var(--brand-paper)/0.3)] focus:border-[hsl(var(--brand-gold))] focus:ring-1 focus:ring-[hsl(var(--brand-gold)/0.4)] outline-none transition-all text-[hsl(var(--brand-ink))]"
                      />
                    )}
                    shouldAutoFocus
                    inputType="tel"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (process.env.NODE_ENV !== "development" && otp.length !== 6)}
                  className="w-full py-3.5 bg-[hsl(var(--brand-midnight))] text-white rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest hover:bg-[hsl(var(--brand-midnight-hover))] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                  {!loading && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center justify-between text-xs font-medium px-1">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-[hsl(var(--brand-ink-soft))] hover:text-[hsl(var(--brand-ink))] transition-colors"
                  >
                    Change Number
                  </button>
                  {resendTimer > 0 ? (
                    <span className="text-[hsl(var(--brand-muted))]">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))] transition-colors font-bold uppercase tracking-wide"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Security Text */}
          <p className="mt-6 text-center text-xs text-[hsl(var(--brand-muted))] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Your information is encrypted and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

