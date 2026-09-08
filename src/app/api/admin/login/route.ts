import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/shared/lib/admin-session"

const SESSION_MAX_AGE = 12 * 60 * 60 // 12 hours
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

/** Comparison that does not short-circuit, so response time reveals nothing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase()
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim()

    if (!adminEmail || !adminPassword) {
      console.error("Admin credentials not configured in environment variables")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const inputEmail = String(email || "").trim().toLowerCase()
    const inputPassword = String(password || "")

    const emailMatches = timingSafeEqual(inputEmail, adminEmail)
    const passwordMatches =
      timingSafeEqual(inputPassword, adminPassword) ||
      timingSafeEqual(inputPassword.trim(), adminPassword)

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const maxAge = rememberMe ? REMEMBER_ME_MAX_AGE : SESSION_MAX_AGE

    // A signed, self-expiring token — not a boolean the client can forge.
    let token: string
    try {
      token = await createAdminSessionToken(maxAge)
    } catch (error) {
      console.error("Failed to create admin session:", error)
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
