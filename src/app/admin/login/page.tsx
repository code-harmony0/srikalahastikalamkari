"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/dashboard/ui/button";
import { Input } from "@/app/dashboard/ui/input";
import { Label } from "@/app/dashboard/ui/label";
import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { AlertCircle, Lock, Mail, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (email === adminEmail && password === adminPassword) {
        
        // Store admin auth state in both localStorage and cookies
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // Set cookie for middleware
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        document.cookie = `isLoggedIn=true; path=/; max-age=${maxAge}; SameSite=Lax`;

        // Small delay to ensure cookie is set, then redirect
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Left Side - Brand Section (55%) */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#0f172a] relative overflow-hidden">
        {/* Subtle background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-500/5 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          {/* Logo */}
          <div
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}
          >
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Brand Title */}
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight" style={{ letterSpacing: '-0.5px' }}>
            Srikalahasti Kalamkari
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-md">
            Enterprise Admin Dashboard
          </p>

          {/* Features List */}
          <div className="w-full max-w-md space-y-4 text-left">
            {[
              { icon: "📊", title: "Real-time Analytics", desc: "Monitor your store performance" },
              { icon: "🛍️", title: "Product Management", desc: "Complete inventory control" },
              { icon: "📦", title: "Order Processing", desc: "Streamlined fulfillment" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (45%) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo (visible only on small screens) */}
          <div className="lg:hidden text-center mb-12">
            <div
              className="inline-flex items-center justify-center w-16 h-16 bg-[#0f172a] rounded-2xl mb-4 mx-auto"
              style={{ boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
            >
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Admin Portal</h1>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            <CardContent className="p-10">
              {/* Header */}
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-[#0f172a] mb-3 tracking-tight" style={{ letterSpacing: '-0.5px' }}>
                  Welcome back
                </h2>
                <p className="text-[#64748b] text-base">
                  Sign in to access your dashboard
                </p>
              </div>


              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <div
                    className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold text-[#64748b] uppercase tracking-widest"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-white border-[#e2e8f0] text-[#334155] text-base placeholder:text-[#cbd5e1] focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10 rounded-xl transition-all"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold text-[#64748b] uppercase tracking-widest"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-white border-[#e2e8f0] text-[#334155] text-base placeholder:text-[#cbd5e1] focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10 rounded-xl transition-all"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={loading}
                      className="border-[#e2e8f0] data-[state=checked]:bg-[#0f172a] data-[state=checked]:border-[#0f172a]"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium text-[#64748b] cursor-pointer select-none"
                    >
                      Remember me for 30 days
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-base rounded-xl transition-all duration-200 mt-8"
                  style={{ boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Security Badge */}
              <div className="mt-8 pt-6 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-center gap-2 text-sm text-[#94a3b8]">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">Secured with enterprise-grade encryption</span>
                </div>
              </div>

              {/* Customer Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-[#64748b]">
                  Customer?{" "}
                  <Link
                    href="/login"
                    className="text-[#0f172a] hover:text-[#1e293b] font-semibold transition-colors underline-offset-4 hover:underline"
                  >
                    Sign in here →
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#94a3b8] font-medium uppercase tracking-wider">
            Srikalahasti Kalamkari © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
