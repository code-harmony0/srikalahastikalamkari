import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/**
 * Service-role client for server code only.
 *
 * The old `supabaseAdmin` export fell back to the public anon key whenever the
 * service key was missing — which is always the case in the browser — so admin
 * screens silently ran unprotected queries and the database had to be opened to
 * the public to make them work. This client refuses both situations: a browser
 * import or a missing key is an error, never a quietly public query.
 */
export function getServiceClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getServiceClient() must only run on the server")
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
  }

  client ??= createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
