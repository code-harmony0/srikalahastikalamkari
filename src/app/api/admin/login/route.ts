import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  ROLE_DEFAULT_PERMISSIONS,
  createAdminSessionToken,
  type AdminPermission,
  type AdminRole,
} from "@/shared/lib/admin-session"
import { verifyAdminPassword } from "@/shared/lib/admin-password"
import { getServiceClient } from "@/lib/supabase/service"

const SESSION_MAX_AGE = 12 * 60 * 60 // 12 hours
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + LOCKOUT_DURATION })
    return { allowed: true }
  }

  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + LOCKOUT_DURATION })
    return { allowed: true }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
  }

  record.count += 1
  return { allowed: true }
}

/** Comparison that does not short-circuit, so response time reveals nothing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      )
    }

    const { email, password, rememberMe } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const inputEmail = String(email || "").trim().toLowerCase()
    const inputPassword = String(password || "")
    let identity: Parameters<typeof createAdminSessionToken>[1]

    try {
      const { data: staff, error } = await getServiceClient()
        .from("admin_users")
        .select("id, name, email, password_hash, role, permissions, is_active")
        .eq("email", inputEmail)
        .maybeSingle()

      if (error) throw error
      if (!staff) throw new Error("No staff account found")
      if (!staff.is_active || !(await verifyAdminPassword(inputPassword, staff.password_hash))) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      const role = staff.role as AdminRole
      const permissions = (staff.permissions as AdminPermission[] | null) ?? []
      identity = {
        sub: staff.id,
        name: staff.name,
        email: staff.email,
        role,
        permissions: permissions.length ? permissions : ROLE_DEFAULT_PERMISSIONS[role],
      }
    } catch (error: unknown) {
      const lookupCode = typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : ""
      const canUseBootstrapAccount =
        lookupCode === "PGRST205" ||
        (error instanceof Error && error.message === "No staff account found")

      // The existing environment account remains a super-admin bootstrap route
      // until the database migration has been applied and the first staff user exists.
      const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase()
      const adminPassword = (process.env.ADMIN_PASSWORD || "").trim()
      const matchesLegacyAccount =
        adminEmail &&
        adminPassword &&
        timingSafeEqual(inputEmail, adminEmail) &&
        (timingSafeEqual(inputPassword, adminPassword) || timingSafeEqual(inputPassword.trim(), adminPassword))

      if (!matchesLegacyAccount) {
        if (!canUseBootstrapAccount) {
          console.error("Admin user lookup failed:", error)
        }
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      identity = { sub: "admin", name: "Store owner", email: adminEmail, role: "super_admin", permissions: ROLE_DEFAULT_PERMISSIONS.super_admin }
    }

    const maxAge = rememberMe ? REMEMBER_ME_MAX_AGE : SESSION_MAX_AGE

    // A signed, self-expiring token — not a boolean the client can forge.
    let token: string
    try {
      token = await createAdminSessionToken(maxAge, identity)
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
    
    // Clear rate limit on successful login
    if (ip !== "unknown") {
      rateLimitMap.delete(ip)
    }

    return response
  } catch {
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
