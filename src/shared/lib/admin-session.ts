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

export const ADMIN_ROLES = ["super_admin", "operations", "sales_staff"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "orders.view",
  "orders.manage",
  "products.view",
  "products.manage",
  "categories.manage",
  "inquiries.manage",
  "reviews.manage",
  "featured.manage",
  "promotions.manage",
  "team.manage",
] as const
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [...ADMIN_PERMISSIONS],
  operations: [
    "dashboard.view", "orders.view", "orders.manage", "products.view",
    "products.manage", "inquiries.manage", "reviews.manage", "featured.manage",
  ],
  sales_staff: ["dashboard.view", "orders.view", "orders.manage", "inquiries.manage"],
}

export type AdminSessionPayload = {
  sub: string
  email: string
  name: string
  role: AdminRole
  permissions: AdminPermission[]
  iat: number
  exp: number
}

export type AdminSessionIdentity = Pick<
  AdminSessionPayload,
  "sub" | "email" | "name" | "role" | "permissions"
>

const LEGACY_SUPER_ADMIN: AdminSessionIdentity = {
  sub: "admin",
  email: "",
  name: "Store owner",
  role: "super_admin",
  permissions: ROLE_DEFAULT_PERMISSIONS.super_admin,
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
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
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
  identity: Partial<AdminSessionIdentity> = {},
): Promise<string> {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSessionPayload = {
    ...LEGACY_SUPER_ADMIN,
    ...identity,
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

    if (!payload.sub || (!payload.email && payload.sub !== "admin")) return null
    if (!ADMIN_ROLES.includes(payload.role)) return null
    if (!Array.isArray(payload.permissions) || payload.permissions.some((permission) => !ADMIN_PERMISSIONS.includes(permission))) return null
    if (typeof payload.name !== "string") return null
    if (typeof payload.exp !== "number") return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}
