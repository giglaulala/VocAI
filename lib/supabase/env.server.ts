import "server-only";

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseServiceRoleKey(): string {
  return requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getSupabaseHealthcheckToken(): string | undefined {
  return process.env.SUPABASE_HEALTHCHECK_TOKEN;
}

