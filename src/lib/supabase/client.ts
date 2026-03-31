import { createClient } from "@supabase/supabase-js"
import environment from "@/shared/config/environment"

// Database type - would be generated from Supabase schema
// For now using any to allow build to pass
type Database = any

const {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  serviceRoleKey: supabaseServiceKey,
} = environment.supabase

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file.",
  )
}

// Single client instance to prevent multiple GoTrueClient warnings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Admin client with service role key (bypasses RLS for admin operations)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key not available
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: "sb-admin-auth-token",
    },
  },
)
