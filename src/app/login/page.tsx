"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, User, ShoppingBag, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useToast } from "@/shared/ui/use-toast";
import { parsePhoneNumber } from "libphonenumber-js";
import OtpInput from "react-otp-input";

export default function UserLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { user, signInWithPhone, verifyPhoneOTP } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect authenticated users
    if (user) {
      router.push("/profile");
    }
  }, [user, router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Format as +91-XXX-XXX-XXXX
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return [match[1], match[2], match[3]].filter(Boolean).join('-');
      }
    }
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return false;

    try {
      const phoneNumberObj = parsePhoneNumber('+91' + cleaned);
      return phoneNumberObj.isValid();
    } catch {
      return false;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = phoneNumber.replace(/\D/g, '');

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Format with country code
    const formattedPhone = '+91' + cleaned;

    const { error } = await signInWithPhone(formattedPhone, 'recaptcha-container');
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } else {
      setStep('otp');
      setResendTimer(60); // 60 seconds cooldown
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${phoneNumber}`,
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error, user: verifiedUser } = await verifyPhoneOTP(otp);
    setLoading(false);

    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "You have successfully signed in.",
      });
      // Redirect will happen via useEffect
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const cleaned = phoneNumber.replace(/\D/g, '');
    const formattedPhone = '+91' + cleaned;

    setLoading(true);
    const { error } = await signInWithPhone(formattedPhone, 'recaptcha-container');
    setLoading(false);

    if (!error) {
      setResendTimer(60);
      setOtp(""); // Clear previous OTP
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] kalamkari-static-background silk-fabric-texture flex items-center justify-center px-4 py-12">
      {/* reCAPTCHA container (hidden) */}
      <div id="recaptcha-container"></div>

      {/* Decorative Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#A0522D] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B8860B] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#A0522D]/10"
        >
          {/* Header - Refined with Light Gradient */}
          <div className="bg-gradient-to-br from-primary/5 to-accent-color/10 p-6 md:p-8 text-center border-b border-border/40">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-white shadow-sm rounded-full flex items-center justify-center border border-primary/10"
            >
              <User className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {step === 'phone'
                ? 'Sign in to your Kailash Kalamkari account'
                : 'Enter the code sent to your phone'}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.div
                  key="phone-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <div className="absolute left-11 top-1/2 -translate-y-1/2 text-foreground/60 font-medium">
                          +91
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="XXX-XXX-XXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                          className="w-full pl-20 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-secondary/10 bg-secondary/5 text-lg tracking-wide"
                          disabled={loading}
                          maxLength={12} // XXX-XXX-XXXX
                          required
                          autoComplete="tel"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        We'll send you a 6-digit verification code
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send Verification Code
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Enter the 6-digit code sent to
                      </p>
                      <p className="text-center font-heading font-bold text-2xl text-foreground mb-8 tracking-wide">
                        +91 {phoneNumber}
                      </p>

                      {/* OTP Input */}
                      <div className="flex justify-center">
                        <OtpInput
                          value={otp}
                          onChange={setOtp}
                          numInputs={6}
                          renderSeparator={<span className="mx-1.5 md:mx-2"></span>}
                          renderInput={(props) => (
                            <input
                              {...props}
                              className="!w-10 !h-12 md:!w-12 md:!h-14 border border-border rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-secondary/10 bg-secondary/5 shadow-sm"
                              disabled={loading}
                            />
                          )}
                          shouldAutoFocus
                          inputType="tel"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Verify & Sign In
                        </>
                      )}
                    </motion.button>

                    {/* Resend OTP */}
                    <div className="flex items-center justify-between text-sm pt-2">
                       <button
                        type="button"
                        onClick={() => {
                          setStep('phone');
                          setOtp("");
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        disabled={loading}
                      >
                        ← Change Number
                      </button>
                      
                      {resendTimer > 0 ? (
                        <p className="text-muted-foreground">
                          Resend in <span className="font-semibold text-primary">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                          disabled={loading}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#A0522D]/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#333333]/60">or</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#A0522D]/20 rounded-xl text-[#A0522D] hover:bg-[#A0522D]/5 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>

              <Link
                href="/dashboard/login"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#B8860B]/20 rounded-xl text-[#B8860B] hover:bg-[#B8860B]/5 transition-all text-sm"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </Link>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-[#333333]/60">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#A0522D] hover:text-[#8B4513] font-medium transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-[#333333]/50 flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          <p>Secure OTP authentication • Your data is protected</p>
        </motion.div>
      </div>
    </div>
  );
}
