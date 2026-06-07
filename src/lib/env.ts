  import { z } from 'zod';

  const envSchema = z.object({
    VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
    VITE_DEMO_MODE: z.boolean().optional()
  });

  const metaEnv = (import.meta as any).env || {};
  const demoModeValue = metaEnv.VITE_DEMO_MODE === 'true' || metaEnv.VITE_DEMO_MODE === true
    ? true
    : metaEnv.VITE_DEMO_MODE === 'false'
      ? false
      : undefined;

  const parseResult = envSchema.safeParse({
    VITE_SUPABASE_URL: metaEnv.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: metaEnv.VITE_SUPABASE_ANON_KEY,
    VITE_DEMO_MODE: demoModeValue
  });

  if (!parseResult.success) {
    const errorMsg = '❌ Environment validation failed: ' + JSON.stringify((parseResult as any).error);
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  export const env = parseResult.data;
