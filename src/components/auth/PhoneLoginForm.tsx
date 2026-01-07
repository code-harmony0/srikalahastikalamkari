"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/contexts/AuthContext"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { toast } from "sonner"
import { FiPhone, FiAlertCircle } from "react-icons/fi"

export function PhoneLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const { signInWithPhone, verifyPhoneOTP } = useAuth()
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate phone number format (should be in E.164 format: +[country code][number])
    if (!phoneNumber.startsWith('+')) {
      setError("Phone number must start with + and country code (e.g., +91 for India)")
      setLoading(false)
      return
    }

    try {
      const { error } = await signInWithPhone(phoneNumber, 'recaptcha-container')

      if (error) {
        setError(error.message || "Failed to send OTP")
        toast.error(error.message || "Failed to send OTP")
      } else {
        setOtpSent(true)
        toast.success("OTP sent to your phone!")
      }
    } catch (error: any) {
      setError(error.message || "Failed to send OTP")
      toast.error(error.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error, user } = await verifyPhoneOTP(otp)

      if (error) {
        setError(error.message || "Invalid OTP")
        toast.error(error.message || "Invalid OTP")
      } else if (user) {
        toast.success("Successfully signed in!")
        router.push("/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "Failed to verify OTP")
      toast.error(error.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Phone Sign In</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {otpSent ? "Enter the OTP sent to your phone" : "Enter your phone number to receive an OTP"}
        </p>
      </div>

      {/* reCAPTCHA container - Firebase will render invisible reCAPTCHA here */}
      <div id="recaptcha-container"></div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +91 for India, +1 for USA)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              disabled={loading}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setOtpSent(false)
              setOtp("")
              setError("")
            }}
            disabled={loading}
          >
            Change Phone Number
          </Button>
        </form>
      )}

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => router.push("/login")}
          className="text-sm"
        >
          Back to email login
        </Button>
      </div>
    </div>
  )
}
