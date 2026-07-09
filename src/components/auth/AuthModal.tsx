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
        description: `Code sent to +91 ${cleaned}`,
      })
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return

    setLoading(true)
    const { error } = await verifyPhoneOTP(otp)
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
      <DialogContent aria-describedby="auth-modal-desc" className="auth-modal-dialog sm:max-w-[420px] p-0 bg-white rounded-[14px] border border-[#C19A5B]/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden [&>button]:hidden">
        {/* Invisible ReCAPTCHA Container — must match the ID passed to signInWithPhone */}
        <div id="auth-modal-recaptcha"></div>

        {/* Modal Header */}
        <div className="relative pt-10 px-8 pb-6 text-center">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full text-[#1A1512]/40 hover:text-[#1A1512] hover:bg-[#1A1512]/5 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-[#1A1512] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#1A1512]/10 border border-[#C19A5B]/30">
            <User className="w-7 h-7 text-[#C19A5B]" />
          </div>

          <DialogTitle className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1512] mb-2">
            {step === "phone" ? "Sign In" : "Verify Phone"}
          </DialogTitle>
          <DialogDescription id="auth-modal-desc" className="font-inter text-[#1A1512]/60 text-sm md:text-base">
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
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#1A1512]/60 font-medium border-r border-[#C19A5B]/20 pr-3">
                    <Phone className="w-4 h-4" /> <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      if (val.length <= 10) setPhoneNumber(val)
                    }}
                    className="w-full pl-24 pr-4 py-3.5 bg-[#FAFAF8]/30 border border-[#C19A5B]/20 rounded-[8px] focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40 transition-all font-inter text-lg text-[#1A1512] tracking-wide placeholder:text-[#1A1512]/20"
                    placeholder="98765 43210"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full py-3.5 bg-[#1A1512] text-white rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest hover:bg-[#C19A5B] shadow-[0_4px_12px_rgba(26,21,18,0.15)] hover:shadow-[0_6px_16px_rgba(26,21,18,0.25)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
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
                <div className="flex justify-center">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="w-2" />}
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="!w-10 !h-12 sm:!w-12 sm:!h-14 border border-[#C19A5B]/20 rounded-[8px] text-center text-xl font-bold bg-[#FAFAF8]/30 focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40 outline-none transition-all text-[#1A1512]"
                      />
                    )}
                    shouldAutoFocus
                    inputType="tel"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 bg-[#1A1512] text-white rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest hover:bg-[#C19A5B] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                  {!loading && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center justify-between text-xs font-medium px-1">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-[#1A1512]/60 hover:text-[#C19A5B] transition-colors"
                  >
                    Change Number
                  </button>
                  {resendTimer > 0 ? (
                    <span className="text-[#1A1512]/40">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#C19A5B] hover:text-[#1A1512] transition-colors font-bold uppercase tracking-wide"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Security Text */}
          <p className="mt-6 text-center text-xs text-[#1A1512]/50 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Your information is encrypted and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

