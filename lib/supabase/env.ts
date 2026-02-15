export function getSupabaseUrl(): string {
  throw new Error(
    "Do not import getSupabaseUrl from lib/supabase/env.ts. Use lib/supabase/env.public.ts instead.",
  );
}

export function getSupabaseAnonKey(): string {
  throw new Error(
    "Do not import getSupabaseAnonKey from lib/supabase/env.ts. Use lib/supabase/env.public.ts instead.",
  );
}

// Server-only env vars (do not use in client components)
export { requiredEnv, getSupabaseServiceRoleKey, getSupabaseHealthcheckToken } from "./env.server";
