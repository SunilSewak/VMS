import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Error-safe singleton client initialization
// Use a permissive `any` type during stabilization to avoid generic signature mismatches.
let supabase: any;

try {
  supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY) as any;
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  throw new Error('Supabase initialization failed');
}

export { supabase };
export type SupabaseClientType = typeof supabase;
export type { User, Session, AuthError } from '@supabase/supabase-js';
