import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Error-safe singleton client initialization
let supabase: ReturnType<typeof createClient>;

try {
  supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  throw new Error('Supabase initialization failed');
}

export { supabase };
export type SupabaseClientType = typeof supabase;
export type { User, Session, AuthError } from '@supabase/supabase-js';
