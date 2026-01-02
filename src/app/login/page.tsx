"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, User, ShoppingBag, Shield } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useToast } from "@/shared/ui/use-toast";

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const { signInWithEmailOTP, verifyEmailOTP, role, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect authenticated users
    if (user) {
      // Check if admin
      if (role === 'super_admin' || role === 'admin') {
        router.push("/dashboard/dashboard-home");
      } else {
        // Regular user goes to profile or home
        router.push("/profile");
      }
    }
  }, [user, role, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithEmailOTP(trimmedEmail);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep('otp');
      toast({
        title: "Code Sent",
        description: "Please check your email for the verification code.",
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
    const { error } = await verifyEmailOTP(email, otp);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "You have successfully signed in.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] kalamkari-static-background silk-fabric-texture flex items-center justify-center px-4 py-12">
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
          {/* Header */}
          <div className="bg-gradient-to-br from-[#A0522D] to-[#8B4513] p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-heading font-light text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Welcome Back
            </h1>
            <p className="text-[#FDF8F2]/90 text-sm">
              Sign in to your Kailash Kalamkari account
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0522D]/50" />
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-[#A0522D]/20 rounded-xl focus:outline-none focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all disabled:opacity-50 disabled:bg-gray-50"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#A0522D] to-[#8B4513] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <p className="text-sm text-[#333333]/70 mb-4 text-center">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0522D]/50" />
                    <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-[#A0522D]/20 rounded-xl focus:outline-none focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all disabled:opacity-50 disabled:bg-gray-50 text-center text-2xl tracking-widest font-mono"
                      disabled={loading}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#A0522D] to-[#8B4513] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-[#A0522D] hover:text-[#8B4513] transition-colors"
                  disabled={loading}
                >
                  ← Back to Email
                </button>
              </form>
            )}

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
          className="mt-6 text-center text-sm text-[#333333]/50"
        >
          <p>Secure authentication • Your data is protected</p>
        </motion.div>
      </div>
    </div>
  );
}
