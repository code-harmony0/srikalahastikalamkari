import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/shared/lib/admin-session"

// Lightweight server-side diagnostic: verifies which image env vars are present
// and whether sharp (Next.js image optimizer) is loadable.
// Protected by a signed admin session — not a public endpoint.
//
// Usage: GET /api/debug/image-env
// Or in browser: visit while logged in as admin
export async function GET(request: NextRequest) {
  const session = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  )
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let sharpAvailable = false
  let sharpVersion: string | null = null
  try {
    // dynamic import avoids bundling sharp into the edge runtime
    const sharp = await import("sharp")
    sharpAvailable = true
    sharpVersion = sharp.default?.versions?.sharp ?? null
  } catch {
    sharpAvailable = false
  }

  const cfHash = process.env.NEXT_PUBLIC_CF_IMAGES_HASH?.trim()
  const cfAccountId = process.env.CF_ACCOUNT_ID?.trim()
  const cfToken = process.env.CF_IMAGES_TOKEN?.trim()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const imageDebug = process.env.NEXT_PUBLIC_IMAGE_DEBUG?.trim()

  const diagnostics = {
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    image: {
      NEXT_PUBLIC_CF_IMAGES_HASH: cfHash ? `SET (${cfHash.length} chars)` : "MISSING — all CF image IDs will render as placeholder",
      CF_ACCOUNT_ID: cfAccountId ? "SET" : "MISSING — uploads will fail",
      CF_IMAGES_TOKEN: cfToken ? "SET" : "MISSING — uploads will fail",
      NEXT_PUBLIC_IMAGE_DEBUG: imageDebug || "not set (add ?imageDebug=1 to URL to enable client debug overlay)",
    },
    supabase: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `SET (${supabaseUrl})` : "MISSING",
    },
    sharp: {
      available: sharpAvailable,
      version: sharpVersion,
      note: sharpAvailable
        ? "Next.js image optimization will work"
        : "sharp not found — local/Supabase images won't optimize. Move sharp to dependencies.",
    },
    tips: [
      "Visit any product page with ?imageDebug=1 in the URL to enable per-image client-side debug overlay",
      "Check browser console (F12) for [cloudflare-images] error messages",
      "If NEXT_PUBLIC_CF_IMAGES_HASH is MISSING, rebuild after setting the env var — it is baked into the client bundle at build time",
    ],
  }

  console.log("[image-env-debug]", JSON.stringify(diagnostics, null, 2))

  return NextResponse.json(diagnostics)
}
