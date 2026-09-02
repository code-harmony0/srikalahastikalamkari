import { cookies } from "next/headers"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/shared/lib/admin-session"

/**
 * Server actions are POST endpoints that anyone who knows the action id can
 * invoke — moving a query to the server does not make it private on its own.
 * Every admin-only action must call this first.
 *
 * Throws on failure so a missed guard surfaces as an error, never as data.
 */
export async function assertAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  )

  if (!session) {
    throw new Error("Unauthorized: admin session required")
  }
}
