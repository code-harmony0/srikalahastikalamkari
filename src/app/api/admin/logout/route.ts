import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/shared/lib/admin-session"

export async function POST() {
  const response = NextResponse.json({ success: true })

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  // Clear the legacy cookie so old sessions do not linger in browsers.
  response.cookies.set("isLoggedIn", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return response
}
