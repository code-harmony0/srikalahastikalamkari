"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, User, Phone, ArrowRight, ShoppingBag, CheckCircle } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useToast } from "@/shared/ui/use-toast";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [loading, setLoading] = useState(false);
  const { signInWithEmailOTP, verifyEmailOTP } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone } = formData;

    if (!name || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithEmailOTP(email.trim().toLowerCase());
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep('verify');
      toast({
        title: "Verification Code Sent",
        description: "Please check your email to verify your account.",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyEmailOTP(formData.email, otp);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to Srikalahasti Kalamkari.",
      });
      router.push("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture flex items-center justify-center px-4 py-12 text-[#1A1512]">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C19A5B] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A1512] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#C19A5B]/20"
        >
          {/* Header */}
          <div className="bg-[#1A1512] p-8 text-center relative">
            <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#C19A5B]/20"
            >
              {step === 'details' ? (
                <User className="w-10 h-10 text-[#C19A5B]" />
              ) : (
                <CheckCircle className="w-10 h-10 text-[#C19A5B]" />
              )}
            </motion.div>
            <h1 className="text-3xl font-serif font-normal text-white mb-2">
              {step === 'details' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-white/70 text-sm font-sans">
              {step === 'details'
                ? 'Join the Srikalahasti Kalamkari family'
                : 'Enter the code sent to your email'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {step === 'details' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#1A1512]/80 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C19A5B]/70" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-[#C19A5B]/30 rounded-xl focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40 transition-all bg-[#FAFAF8]/30 text-[#1A1512]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1A1512]/80 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C19A5B]/70" />
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-[#C19A5B]/30 rounded-xl focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40 transition-all bg-[#FAFAF8]/30 text-[#1A1512]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#1A1512]/80 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C19A5B]/70" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-[#C19A5B]/30 rounded-xl focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40 transition-all bg-[#FAFAF8]/30 text-[#1A1512]"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full bg-[#1A1512] text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#C19A5B] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <p className="text-sm text-[#1A1512]/70 mb-4 text-center">
                    Enter the 6-digit code sent to <strong>{formData.email}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-[#C19A5B]/30 rounded-xl focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40 transition-all text-center text-2xl tracking-widest font-mono text-[#1A1512] bg-[#FAFAF8]/30"
                    maxLength={6}
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full bg-[#1A1512] text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#C19A5B] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Complete Sign Up
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-sm text-[#1A1512]/60 hover:text-[#C19A5B] transition-colors"
                  disabled={loading}
                >
                  ← Back to Details
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C19A5B]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#1A1512]/60">or</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 border border-[#C19A5B]/20 rounded-xl text-[#1A1512] hover:bg-[#C19A5B]/10 hover:border-[#C19A5B]/40 transition-all font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>
            </div>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-[#1A1512]/60">
              Already have an account?{" "}
              <Link href="/login" className="text-[#C19A5B] hover:text-[#1A1512] font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-[#1A1512]/50"
        >
          <p>Secure registration • We respect your privacy</p>
        </motion.div>
      </div>
    </div>
  );
}
