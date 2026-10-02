import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminRole } from "@/shared/lib/admin-guard"
import { hashAdminPassword } from "@/shared/lib/admin-password"
import { getServiceClient } from "@/lib/supabase/service"
import { ADMIN_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, type AdminPermission, type AdminRole } from "@/shared/lib/admin-session"

const assignableRoles = ["operations", "sales_staff"] as const
const permissionSchema = z.enum(ADMIN_PERMISSIONS)

const staffSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
  role: z.enum(assignableRoles),
  permissions: z.array(permissionSchema).min(1).max(ADMIN_PERMISSIONS.length),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
  role: z.enum(assignableRoles).optional(),
  permissions: z.array(permissionSchema).min(1).max(ADMIN_PERMISSIONS.length).optional(),
})

function isAllowedPermission(role: AdminRole, permission: AdminPermission) {
  return ROLE_DEFAULT_PERMISSIONS[role].includes(permission)
}

function validatePermissions(role: AdminRole, permissions: AdminPermission[]) {
  return permissions.every((permission) => isAllowedPermission(role, permission))
}

function databaseError(error: unknown) {
  console.error("Admin user operation failed:", error)
  return NextResponse.json(
    { error: "Unable to update staff. Ensure migration 013_add_admin_users.sql has been applied." },
    { status: 500 },
  )
}

export async function GET() {
  try {
    await assertAdminRole("super_admin")
    const { data, error } = await getServiceClient()
      .from("admin_users")
      .select("id, name, email, role, permissions, is_active, created_at")
      .order("created_at", { ascending: true })

    if (error) throw error
    return NextResponse.json({ users: data })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return databaseError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertAdminRole("super_admin")
    const payload = staffSchema.parse(await request.json())
    if (!validatePermissions(payload.role, payload.permissions)) {
      return NextResponse.json({ error: "That permission is not available for this staff role." }, { status: 400 })
    }
    const passwordHash = await hashAdminPassword(payload.password)
    const { data, error } = await getServiceClient()
      .from("admin_users")
      .insert({
        name: payload.name,
        email: payload.email,
        password_hash: passwordHash,
        role: payload.role,
        permissions: payload.permissions,
      })
      .select("id, name, email, role, permissions, is_active, created_at")
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "An admin user already uses this email." }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ user: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a name, valid email, and a password of at least 12 characters." }, { status: 400 })
    }
    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return databaseError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await assertAdminRole("super_admin")
    const payload = updateSchema.parse(await request.json())
    if (payload.id === session.sub) {
      return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 })
    }
    const { data: existing, error: existingError } = await getServiceClient()
      .from("admin_users")
      .select("role")
      .eq("id", payload.id)
      .maybeSingle()
    if (existingError) throw existingError
    if (!existing || existing.role === "super_admin") return NextResponse.json({ error: "That account is protected." }, { status: 400 })

    const nextRole = payload.role ?? existing.role as AdminRole
    if (payload.permissions && !validatePermissions(nextRole, payload.permissions)) {
      return NextResponse.json({ error: "That permission is not available for this staff role." }, { status: 400 })
    }
    const update: { is_active?: boolean; role?: typeof payload.role; permissions?: AdminPermission[] } = {}
    if (payload.isActive !== undefined) update.is_active = payload.isActive
    if (payload.role) update.role = payload.role
    if (payload.permissions) update.permissions = payload.permissions
    const { data, error } = await getServiceClient()
      .from("admin_users")
      .update(update)
      .eq("id", payload.id)
      .select("id, name, email, role, permissions, is_active, created_at")
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: "Staff account not found." }, { status: 404 })
    return NextResponse.json({ user: data })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid staff account." }, { status: 400 })
    if (error instanceof Error && error.message.startsWith("Forbidden")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (error instanceof Error && error.message.startsWith("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return databaseError(error)
  }
}
