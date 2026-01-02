import { createClient } from "@supabase/supabase-js";

// Use Next.js env variables (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn(
		"NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add them to your .env.local file to connect to Supabase."
	);
}

// Create client with dummy values if env vars missing (prevents app crash)
export const supabase = createClient(
	supabaseUrl || "https://placeholder.supabase.co", 
	supabaseAnonKey || "placeholder-anon-key"
);
