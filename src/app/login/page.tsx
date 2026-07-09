"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  User,
} from "lucide-react"
import { useAuth } from "@/shared/contexts/AuthContext"
import { toast } from "sonner"
import OtpInput from "react-otp-input"

export default function UserLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const { user, signInWithPhone, verifyPhoneOTP } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get("redirect") || "/profile"
      router.push(redirectTo)
    }
  }, [user, router])

  // Timer Logic
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Cleanup RecaptchaVerifier on unmount
  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear()
        } catch (e) {
          console.error("Failed to clear recaptcha verifier on unmount:", e)
        }
        ;(window as any).recaptchaVerifier = null
      }
    }
  }, [])

  // --- Handlers ---

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
      "recaptcha-container",
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
      toast.success("Welcome Back!", { description: "Redirecting you..." })
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    const cleaned = phoneNumber.replace(/\D/g, "")
    const formattedPhone = "+91" + cleaned

    setLoading(true)
    const { error } = await signInWithPhone(
      formattedPhone,
      "recaptcha-container",
    )
    setLoading(false)

    if (!error) {
      setResendTimer(30)
      setOtp("")
      toast.success("Code Resent", { description: "A new code has been sent." })
    }
  }

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* 🏛 MERGED HERO SECTION (Premium Dark Charcoal Hero) */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden h-[180px] md:h-[220px] bg-[#1A1512]">
        <div className="absolute inset-0 z-[6] pointer-events-none">
          <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-2xl mx-auto"
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-[#C19A5B] mb-2">
            Authentication
          </span>

          <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-white tracking-wide leading-tight mb-2 uppercase">
            Welcome <span className="italic text-[#C19A5B] font-normal lowercase">back</span>
          </h1>

          <p className="font-sans text-white/70 text-[13px] md:text-[14px] font-light tracking-wide max-w-[600px] leading-relaxed">
            Sign in to your Srikalahasti Kalamkari account.
          </p>
        </motion.div>
      </section>

      {/* 📦 MAIN CONTENT */}
      <div className="flex flex-col items-center justify-center px-4 py-12 md:py-16">
        {/* Invisible ReCAPTCHA */}
        <div id="recaptcha-container"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] bg-white rounded-[14px] border border-[#C19A5B]/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* Card Header */}
          <div className="pt-10 px-8 pb-6 text-center">
            <div className="w-14 h-14 bg-[#1A1512] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#1A1512]/10 border border-[#C19A5B]/30">
              <User className="w-7 h-7 text-[#C19A5B]" />
            </div>
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1512] mb-2">
              {step === "phone" ? "Sign In" : "Verify Phone"}
            </h2>
            <p className="font-inter text-[#1A1512]/60 text-sm md:text-base">
              {step === "phone"
                ? "Enter your mobile number to continue."
                : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
            </p>
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

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C19A5B]/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-[#1A1512]/40 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Secondary Action */}
            <Link href="/" className="block">
              <button
                type="button"
                className="w-full py-3 border border-[#C19A5B]/20 rounded-[8px] text-[#1A1512] font-inter font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#C19A5B]/10 hover:border-[#C19A5B]/40 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </button>
            </Link>

            {/* Footer Text */}
            <p className="mt-6 text-center text-xs text-[#1A1512]/50 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Your information is
              encrypted and secure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
