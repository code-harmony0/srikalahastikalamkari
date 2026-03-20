import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import environment from '@/shared/config/environment';

const { url: supabaseUrl, anonKey: supabaseAnonKey, serviceRoleKey: supabaseServiceKey } = environment.supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Single client instance to prevent multiple GoTrueClient warnings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client with service role key (bypasses RLS for admin operations)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key not available
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: 'sb-admin-auth-token',
    },
  }
);
