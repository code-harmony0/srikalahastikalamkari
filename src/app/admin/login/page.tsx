"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/dashboard/ui/button"
import { Input } from "@/app/dashboard/ui/input"
import { Checkbox } from "@/shared/ui/checkbox"
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"

/* ─── Keyframe injection (runs once, client-side only) ─────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  @keyframes admin-panel-in {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes admin-form-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes admin-motif-drift {
    0%   { transform: translateY(0px) rotate(0deg); }
    50%  { transform: translateY(-8px) rotate(1.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes admin-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes admin-error-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes admin-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes admin-gold-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(193,154,91,0); }
    50%       { box-shadow: 0 0 0 6px rgba(193,154,91,0.12); }
  }

  .admin-panel { animation: admin-panel-in 0.7s cubic-bezier(.22,.61,.36,1) both; }
  .admin-form  { animation: admin-form-in 0.65s cubic-bezier(.22,.61,.36,1) 0.15s both; }
  .admin-motif { animation: admin-motif-drift 8s ease-in-out infinite; }

  .admin-input {
    width: 100%;
    height: 48px;
    background: rgba(255,255,255,0.6);
    border: 1.5px solid #e4ddd4;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #1A1512;
    transition: border-color .2s, box-shadow .2s, background .2s;
    outline: none;
    padding: 0 44px 0 44px;
  }
  .admin-input::placeholder { color: #a99b8e; }
  .admin-input:focus {
    border-color: #C19A5B;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(193,154,91,0.12);
  }
  .admin-input:disabled { opacity: 0.55; cursor: not-allowed; }

  .admin-btn-primary {
    width: 100%;
    height: 48px;
    background: linear-gradient(135deg, #1A1512 0%, #2E2623 100%);
    color: #FAFAF8;
    border: none;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(26,21,18,0.25);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .admin-btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(193,154,91,0.15) 50%, transparent 100%);
    background-size: 400px 100%;
    opacity: 0;
    transition: opacity .3s;
  }
  .admin-btn-primary:hover:not(:disabled)::after {
    opacity: 1;
    animation: admin-shimmer 1.2s linear infinite;
  }
  .admin-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(26,21,18,0.3);
  }
  .admin-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .admin-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .admin-btn-primary:focus-visible {
    outline: 2px solid #C19A5B;
    outline-offset: 3px;
  }
  .admin-btn-primary.gold-pulse { animation: admin-gold-pulse 2s ease-in-out infinite; }

  .admin-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: admin-spin 0.75s linear infinite;
    flex-shrink: 0;
  }

  .admin-label {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #7a6a5a;
    margin-bottom: 8px;
  }

  .admin-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: #fff5f5;
    border: 1.5px solid #fca5a5;
    border-radius: 10px;
    animation: admin-error-in 0.3s ease both;
  }
  .admin-error p {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #b91c1c;
    line-height: 1.4;
  }

  .admin-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e4ddd4, transparent);
    margin: 28px 0;
  }

  .admin-icon-wrap {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #a99b8e;
    display: flex;
    align-items: center;
  }

  .admin-eye-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #a99b8e;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    transition: color .15s;
  }
  .admin-eye-btn:hover { color: #5a4a3a; }
  .admin-eye-btn:focus-visible { outline: 2px solid #C19A5B; border-radius: 4px; }

  /* Responsive visibility */
  .admin-left-panel { display: none; }
  @media (min-width: 1024px) {
    .admin-left-panel { display: flex; }
  }
  .admin-mobile-logo { display: block; }
  @media (min-width: 1024px) {
    .admin-mobile-logo { display: none; }
  }
`

/* ─── Kalamkari SVG Motif (inline, no external dep) ─────────────────── */
function KalamkariMotif() {
  return (
    <svg
      viewBox="0 0 280 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="admin-motif"
      aria-hidden="true"
      style={{ width: 220, height: 252, opacity: 0.18 }}
    >
      {/* Central lotus bloom */}
      <circle cx="140" cy="160" r="40" stroke="#C19A5B" strokeWidth="1.2" />
      <circle cx="140" cy="160" r="26" stroke="#C19A5B" strokeWidth="0.8" />
      <circle cx="140" cy="160" r="13" stroke="#C19A5B" strokeWidth="0.6" fill="rgba(193,154,91,0.06)" />
      {/* 8 petals */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = deg * Math.PI / 180
        const cx = 140 + 54 * Math.sin(r)
        const cy = 160 - 54 * Math.cos(r)
        return (
          <ellipse
            key={i}
            cx={cx} cy={cy}
            rx="11" ry="18"
            transform={`rotate(${deg} ${cx} ${cy})`}
            stroke="#C19A5B" strokeWidth="0.8"
            fill="rgba(193,154,91,0.04)"
          />
        )
      })}
      {/* Outer ring dots */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const r = deg * Math.PI / 180
        return (
          <circle
            key={i}
            cx={140 + 90 * Math.sin(r)}
            cy={160 - 90 * Math.cos(r)}
            r="2.5"
            fill="#C19A5B"
          />
        )
      })}
      {/* Decorative corner flourishes */}
      <path d="M20 20 Q50 10 80 20 Q70 50 60 60" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M20 20 Q10 50 20 80 Q50 70 60 60" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M260 20 Q230 10 200 20 Q210 50 220 60" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M260 20 Q270 50 260 80 Q230 70 220 60" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M20 300 Q50 310 80 300 Q70 270 60 260" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M20 300 Q10 270 20 240 Q50 250 60 260" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M260 300 Q230 310 200 300 Q210 270 220 260" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      <path d="M260 300 Q270 270 260 240 Q230 250 220 260" stroke="#C19A5B" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      {/* Peacock tail lines */}
      {[-40,-20,0,20,40].map((offset, i) => (
        <line
          key={i}
          x1={140 + offset} y1="72"
          x2={140 + offset * 0.3} y2="118"
          stroke="#C19A5B" strokeWidth="0.5" strokeLinecap="round"
        />
      ))}
      {[-40,-20,0,20,40].map((offset, i) => (
        <line
          key={i}
          x1={140 + offset} y1="248"
          x2={140 + offset * 0.3} y2="202"
          stroke="#C19A5B" strokeWidth="0.5" strokeLinecap="round"
        />
      ))}
      {/* Border rule */}
      <rect x="8" y="8" width="264" height="304" rx="4"
        stroke="#C19A5B" strokeWidth="0.6" strokeDasharray="4 4" />
    </svg>
  )
}

/* ─── Gold dot separator ─────────────────────────────────────────────── */
function GoldStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28,
        fontWeight: 300,
        color: "#C19A5B",
        lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(193,154,91,0.6)",
        marginTop: 4,
      }}>{label}</div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.")
        return
      }
      window.location.href = "/dashboard"
    } catch {
      setError("A network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Inject styles once ── */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
        background: "#FAFAF8",
      }}>

        {/* ═══════════════════════════════════════════════
            LEFT PANEL — Brand identity
        ════════════════════════════════════════════════ */}
        <div
          className="admin-panel admin-left-panel"
          style={{
            width: "52%",
            background: "linear-gradient(160deg, #1A1512 0%, #2E2623 60%, #1A1512 100%)",
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 56px",
          }}
        >
          {/* Ambient glows */}
          <div style={{
            position: "absolute", top: "15%", left: "20%",
            width: 340, height: 340,
            background: "radial-gradient(circle, rgba(193,154,91,0.07) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "20%", right: "10%",
            width: 240, height: 240,
            background: "radial-gradient(circle, rgba(193,154,91,0.05) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          {/* Border inset */}
          <div style={{
            position: "absolute", inset: 20,
            border: "1px solid rgba(193,154,91,0.12)",
            borderRadius: 16, pointerEvents: "none",
          }} />

          {/* Kalamkari motif — absolute center */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <KalamkariMotif />
          </div>

          {/* Content */}
          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 360 }}>

            {/* Wordmark */}
            <div style={{ marginBottom: 48 }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#C19A5B",
                marginBottom: 14,
              }}>
                Est. 1999 · Srikalahasti
              </div>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 42,
                fontWeight: 300,
                lineHeight: 1.05,
                color: "#FAFAF8",
                letterSpacing: "-0.01em",
                margin: 0,
              }}>
                Kalamkari<br />
                <em style={{ color: "#C19A5B", fontStyle: "italic" }}>Heritage</em>
              </h1>
              <div style={{
                marginTop: 16,
                height: 1,
                width: 48,
                background: "linear-gradient(90deg, #C19A5B, transparent)",
              }} />
            </div>

            {/* Body copy */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              lineHeight: 1.7,
              color: "rgba(250,250,248,0.55)",
              fontWeight: 300,
              marginBottom: 48,
              maxWidth: 300,
            }}>
              Manage your artisan inventory, track orders, and grow a heritage craft brand — all from one place.
            </p>

            {/* Stats row */}
            <div style={{
              display: "flex",
              gap: 0,
              borderTop: "1px solid rgba(193,154,91,0.15)",
              borderBottom: "1px solid rgba(193,154,91,0.15)",
              padding: "20px 0",
            }}>
              <div style={{ flex: 1 }}>
                <GoldStat value="25+" label="Years" />
              </div>
              <div style={{ width: 1, background: "rgba(193,154,91,0.15)", margin: "0 4px" }} />
              <div style={{ flex: 1 }}>
                <GoldStat value="2k+" label="Products" />
              </div>
              <div style={{ width: 1, background: "rgba(193,154,91,0.15)", margin: "0 4px" }} />
              <div style={{ flex: 1 }}>
                <GoldStat value="100%" label="Handmade" />
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RIGHT PANEL — Login form
        ════════════════════════════════════════════════ */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "#FAFAF8",
        }}>
          <div className="admin-form" style={{ width: "100%", maxWidth: 420 }}>

            {/* Mobile wordmark */}
            <div style={{ textAlign: "center", marginBottom: 40 }} className="admin-mobile-logo">
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52, height: 52,
                background: "#1A1512",
                borderRadius: 14,
                marginBottom: 12,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="#C19A5B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26,
                fontWeight: 400,
                color: "#1A1512",
                margin: 0,
              }}>Admin Portal</h1>
            </div>

            {/* Card */}
            <div style={{
              background: "#fff",
              borderRadius: 18,
              padding: "40px 40px 36px",
              boxShadow: "0 2px 4px rgba(26,21,18,0.04), 0 12px 32px rgba(26,21,18,0.09), 0 40px 80px rgba(26,21,18,0.06)",
              border: "1px solid rgba(26,21,18,0.07)",
            }}>

              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#C19A5B",
                  marginBottom: 8,
                }}>
                  Admin Access
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 34,
                  fontWeight: 400,
                  color: "#1A1512",
                  margin: "0 0 6px",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}>
                  Welcome back
                </h2>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: "#7a6a5a",
                  margin: 0,
                  fontWeight: 300,
                }}>
                  Sign in to your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* Error */}
                {error && (
                  <div className="admin-error" style={{ marginBottom: 20 }}>
                    <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p>{error}</p>
                  </div>
                )}

                {/* Email */}
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="email" className="admin-label">Email Address</label>
                  <div style={{ position: "relative" }}>
                    <span className="admin-icon-wrap">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@kalamkari.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="admin-input"
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="password" className="admin-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <span className="admin-icon-wrap">
                      <Lock size={16} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="admin-input"
                      disabled={loading}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="admin-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword
                        ? <EyeOff size={16} />
                        : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v as boolean)}
                    disabled={loading}
                    style={{ accentColor: "#1A1512" }}
                  />
                  <label
                    htmlFor="remember"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 400,
                      color: "#7a6a5a",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Keep me signed in for 30 days
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`admin-btn-primary${!loading ? " gold-pulse" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="admin-spinner" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="admin-divider" />

              {/* Footer links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#a99b8e",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  End-to-end encrypted session
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "#a99b8e",
                  margin: 0,
                }}>
                  Customer?{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "#1A1512",
                      fontWeight: 600,
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(26,21,18,0.25)",
                      paddingBottom: 1,
                      transition: "border-color .15s",
                    }}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

            </div>

            {/* Subtle footer */}
            <p style={{
              textAlign: "center",
              marginTop: 24,
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "#c5b9ae",
              letterSpacing: "0.06em",
            }}>
              © {new Date().getFullYear()} Srikalahasti Kalamkari · All rights reserved
            </p>

          </div>
        </div>

      </div>
    </>
  )
}
