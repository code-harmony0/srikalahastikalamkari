import { cookies } from "next/headers"
import {
  ADMIN_SESSION_COOKIE,
  type AdminRole,
  type AdminPermission,
  type AdminSessionPayload,
  verifyAdminSessionToken,
} from "@/shared/lib/admin-session"

/**
 * Server actions are POST endpoints that anyone who knows the action id can
 * invoke — moving a query to the server does not make it private on its own.
 * Every admin-only action must call this first.
 *
 * Throws on failure so a missed guard surfaces as an error, never as data.
 */
export async function assertAdminSession(): Promise<AdminSessionPayload> {
  const cookieStore = await cookies()
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  )

  if (!session) {
    throw new Error("Unauthorized: admin session required")
  }

  return session
}

export async function assertAdminRole(
  ...allowedRoles: AdminRole[]
): Promise<AdminSessionPayload> {
  const session = await assertAdminSession()
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden: insufficient admin permissions")
  }

  return session
}

export async function assertAdminPermission(
  ...requiredPermissions: AdminPermission[]
): Promise<AdminSessionPayload> {
  const session = await assertAdminSession()
  if (!requiredPermissions.every((permission) => session.permissions.includes(permission))) {
    throw new Error("Forbidden: insufficient admin permissions")
  }
  return session
}
