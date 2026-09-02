/**
 * Signed admin session tokens.
 *
 * Replaces the previous `isLoggedIn=true` cookie, which any visitor could forge
 * with a single line in the browser console. Tokens are HMAC-SHA256 signed with
 * ADMIN_SESSION_SECRET and carry their own expiry, so a stolen or edited cookie
 * fails verification.
 *
 * Uses Web Crypto only, so the same module runs in the edge middleware and in
 * Node server components without a second implementation.
 */

const ADMIN_SESSION_COOKIE = "admin_session"
const MIN_SECRET_LENGTH = 32

export { ADMIN_SESSION_COOKIE }

export type AdminSessionPayload = {
  sub: string
  iat: number
  exp: number
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `ADMIN_SESSION_SECRET must be set and at least ${MIN_SECRET_LENGTH} characters`,
    )
  }
  return secret
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return base64UrlEncode(new Uint8Array(signature))
}

/** Length-independent comparison so a mismatch leaks no timing information. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function createAdminSessionToken(
  maxAgeSeconds: number,
): Promise<string> {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSessionPayload = {
    sub: "admin",
    iat: now,
    exp: now + maxAgeSeconds,
  }
  const encoded = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  )
  return `${encoded}.${await sign(encoded, secret)}`
}

/**
 * Returns the payload for a valid, unexpired token, or null for anything else.
 * Never throws on malformed input — a bad cookie is a logged-out user, not a
 * server error.
 */
export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  if (!token) return null

  const separator = token.lastIndexOf(".")
  if (separator <= 0) return null

  const encoded = token.slice(0, separator)
  const signature = token.slice(separator + 1)

  let secret: string
  try {
    secret = getSecret()
  } catch {
    // Fail closed: an unconfigured secret denies access rather than granting it.
    return null
  }

  const expected = await sign(encoded, secret)
  if (!timingSafeEqual(signature, expected)) return null

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encoded)),
    ) as AdminSessionPayload

    if (payload.sub !== "admin") return null
    if (typeof payload.exp !== "number") return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}
