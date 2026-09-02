import { createClient } from "@supabase/supabase-js"
import environment from "@/shared/config/environment"

/**
 * Service-role Supabase client. Server-side only.
 *
 * The previous `supabaseAdmin` in ./client.ts fell back to the anon key when the
 * service-role key was absent — which is always, in the browser, because the key
 * has no NEXT_PUBLIC_ prefix. Dashboard "admin" queries therefore ran as `anon`
 * and only worked because RLS was wide open. This client never falls back: if the
 * service-role key is missing it throws, so a misconfiguration fails loudly
 * instead of silently degrading to a public-permissions client.
 */

type Database = any

const { url, serviceRoleKey } = environment.supabase

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/supabase/admin.ts was imported in a browser bundle. " +
      "It holds the service-role key and must only be used from server code.",
  )
}

if (!url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY. Server-side Supabase access requires it; " +
      "there is deliberately no anon-key fallback.",
  )
}

export const supabaseAdmin = createClient<Database>(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
